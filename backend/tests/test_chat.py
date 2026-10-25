import pytest
from fastapi.testclient import TestClient

from app.api import chat as chat_api
from app.main import app
from app.schemas.chat import ChatTurn
from app.services import llm, rate_limit

client = TestClient(app)


@pytest.fixture(autouse=True)
def _reset_limiter():
    rate_limit._hits.clear()


def test_safety_short_circuits_llm(monkeypatch):
    async def boom(*a, **k):
        raise AssertionError("LLM must not be called for red flags")
    monkeypatch.setattr(chat_api, "generate_reply", boom)
    r = client.post("/api/chat", json={"message": "chest pain and can't breathe", "language": "en"})
    assert r.status_code == 200
    body = r.json()
    assert body["source"] == "safety" and body["safety_category"] == "medical"


def test_normal_message_uses_llm(monkeypatch):
    async def fake(message, language, history):
        assert language == "hi" and len(history) == 1
        return "ठीक है"
    monkeypatch.setattr(chat_api, "generate_reply", fake)
    r = client.post("/api/chat", json={
        "message": "मैं थकी रहती हूँ", "language": "hi",
        "history": [{"role": "assistant", "text": "नमस्ते"}]})
    assert r.json() == {"reply": "ठीक है", "language": "hi", "source": "llm", "safety_category": None}


def test_llm_down_returns_503(monkeypatch):
    async def down(*a, **k):
        raise llm.LLMUnavailable("no key")
    monkeypatch.setattr(chat_api, "generate_reply", down)
    assert client.post("/api/chat", json={"message": "hello"}).status_code == 503


def test_validation():
    assert client.post("/api/chat", json={"message": "   "}).status_code == 422
    assert client.post("/api/chat", json={"message": "hi", "language": "fr"}).status_code == 422
    assert client.post("/api/chat", json={"message": "x" * 1001}).status_code == 422


def test_rate_limit(monkeypatch):
    async def fake(*a, **k):
        return "ok"
    monkeypatch.setattr(chat_api, "generate_reply", fake)
    monkeypatch.setattr(chat_api.settings, "chat_rate_limit", 3, raising=False)
    codes = [client.post("/api/chat", json={"message": "hello"}).status_code for _ in range(5)]
    assert codes == [200, 200, 200, 429, 429]


def test_build_messages_alternates_and_starts_with_user():
    hist = [ChatTurn(role="assistant", text="hi"), ChatTurn(role="user", text="a"),
            ChatTurn(role="user", text="b"), ChatTurn(role="assistant", text="c")]
    msgs = llm.build_messages(hist, "d")
    assert [m["role"] for m in msgs] == ["user", "assistant", "user"]
    assert msgs[0]["content"] == "a\nb" and msgs[-1]["content"] == "d"
