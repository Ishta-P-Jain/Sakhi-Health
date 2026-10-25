"""Thin wrapper around the Anthropic Messages API. The API key stays server-side."""
import logging

from anthropic import APIError, AsyncAnthropic

from app.config import settings
from app.schemas.chat import ChatTurn
from app.services.prompts import build_system_prompt

log = logging.getLogger("sakhi.llm")
_client: AsyncAnthropic | None = None


class LLMUnavailable(Exception):
    """Raised when the model can't be reached or isn't configured."""


def _get_client() -> AsyncAnthropic:
    global _client
    if not settings.anthropic_api_key:
        raise LLMUnavailable("ANTHROPIC_API_KEY is not set")
    if _client is None:
        _client = AsyncAnthropic(
            api_key=settings.anthropic_api_key, timeout=settings.llm_timeout, max_retries=1
        )
    return _client


def build_messages(history: list[ChatTurn], message: str) -> list[dict]:
    """Anthropic needs strictly alternating roles starting with 'user'. Clean up whatever the client sent."""
    turns = [{"role": t.role, "content": t.text.strip()} for t in history[-10:] if t.text.strip()]
    turns.append({"role": "user", "content": message})
    merged: list[dict] = []
    for t in turns:
        if merged and merged[-1]["role"] == t["role"]:
            merged[-1]["content"] += "\n" + t["content"]
        else:
            merged.append(dict(t))
    while merged and merged[0]["role"] != "user":
        merged.pop(0)
    return merged


async def generate_reply(message: str, language: str, history: list[ChatTurn]) -> str:
    client = _get_client()
    try:
        resp = await client.messages.create(
            model=settings.llm_model,
            max_tokens=settings.llm_max_tokens,
            system=build_system_prompt(language),
            messages=build_messages(history, message),
        )
    except APIError as exc:  # network, auth, rate limit, overload ...
        log.warning("LLM call failed: %s", type(exc).__name__)
        raise LLMUnavailable(str(exc)) from exc
    text = "".join(b.text for b in resp.content if getattr(b, "type", "") == "text").strip()
    if not text:
        raise LLMUnavailable("empty model response")
    return text
