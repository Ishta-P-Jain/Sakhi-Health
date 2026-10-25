from typing import Literal

from pydantic import BaseModel, Field, field_validator

LanguageCode = Literal["en", "hi", "kn", "ta", "te", "bn"]


class ChatTurn(BaseModel):
    role: Literal["user", "assistant"]
    text: str = Field(max_length=2000)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)
    language: LanguageCode = "en"
    history: list[ChatTurn] = Field(default_factory=list, max_length=20)

    @field_validator("message")
    @classmethod
    def not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("message must not be blank")
        return v


class ChatResponse(BaseModel):
    reply: str
    language: LanguageCode
    # "safety" = fixed emergency message, no model call was made
    source: Literal["llm", "safety"]
    safety_category: Literal["medical", "selfharm", "abuse"] | None = None
