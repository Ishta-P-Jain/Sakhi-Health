"""Local Ollama integration for Sakhi Health."""

import logging
import os

import httpx
from dotenv import load_dotenv

from app.schemas.chat import ChatTurn
from app.services.prompts import build_system_prompt

load_dotenv()

log = logging.getLogger("sakhi.llm")

OLLAMA_BASE_URL = os.getenv(
    "OLLAMA_BASE_URL", "http://localhost:11434"
).rstrip("/")

OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gpt-oss:120b-cloud")


class LLMUnavailable(Exception):
    """Raised when the local AI model cannot be reached."""


def build_messages(
    history: list[ChatTurn], message: str
) -> list[dict[str, str]]:
    """Prepare recent conversation history."""

    turns: list[dict[str, str]] = []

    for turn in history[-10:]:
        role = getattr(turn, "role", "")
        content = (getattr(turn, "text", "") or "").strip()

        if role in {"user", "assistant"} and content:
            turns.append({"role": role, "content": content})

    if message.strip():
        turns.append({"role": "user", "content": message.strip()})

    merged: list[dict[str, str]] = []

    for turn in turns:
        if merged and merged[-1]["role"] == turn["role"]:
            merged[-1]["content"] += "\n" + turn["content"]
        else:
            merged.append(dict(turn))

    while merged and merged[0]["role"] != "user":
        merged.pop(0)

    return merged


async def generate_reply(
    message: str,
    language: str,
    history: list[ChatTurn],
) -> str:
    """Generate a reply using the local Ollama model."""

    payload = {
        "model": OLLAMA_MODEL,
        "messages": [
            {
                "role": "system",
                "content": build_system_prompt(language),
            },
            *build_messages(history, message),
        ],
        "stream": False,
        "options": {
            "temperature": 0.2,
            "num_predict": 350,
        },
    }

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/chat",
                json=payload,
            )
            response.raise_for_status()
            data = response.json()

    except httpx.HTTPStatusError as exc:
        log.warning("Ollama returned HTTP %s", exc.response.status_code)
        raise LLMUnavailable(
            "The local AI model returned an error. Check that the model is installed."
        ) from exc

    except httpx.RequestError as exc:
        log.warning("Could not connect to Ollama.")
        raise LLMUnavailable(
            "Cannot connect to Ollama. Make sure it is running on this computer."
        ) from exc

    except ValueError as exc:
        log.warning("Ollama returned invalid JSON.")
        raise LLMUnavailable(
            "The local AI service returned an unreadable response."
        ) from exc

    reply = data.get("message", {}).get("content", "").strip()

    if not reply:
        raise LLMUnavailable("The model returned an empty response. Please try again.")

    return reply
