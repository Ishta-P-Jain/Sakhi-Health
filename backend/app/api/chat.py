from fastapi import APIRouter, HTTPException, Request

from app.config import settings
from app.schemas.chat import ChatRequest, ChatResponse
from app.services import rate_limit
from app.services.llm import LLMUnavailable, generate_reply
from app.services.safety import check_red_flags

router = APIRouter(tags=["assistant"])


def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, request: Request) -> ChatResponse:
    if not rate_limit.allow(_client_ip(request), settings.chat_rate_limit):
        raise HTTPException(status_code=429, detail="too_many_requests")

    # 1) Safety first: fixed, pre-written messages for emergencies. No model call.
    flag = check_red_flags(req.message, req.language)
    if flag:
        category, message = flag
        return ChatResponse(
            reply=message, language=req.language, source="safety", safety_category=category
        )

    # 2) Otherwise ask the model. The frontend falls back to offline answers on 503.
    try:
        reply = await generate_reply(req.message, req.language, req.history)
    except LLMUnavailable:
        raise HTTPException(status_code=503, detail="assistant_unavailable")
    return ChatResponse(reply=reply, language=req.language, source="llm")
