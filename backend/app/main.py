"""FastAPI entry point.

Member 3 wires the chat + healthcare routers. Member 2: add your routers
(health profile, symptoms, reminders, reports) in the marked block below.
Run:  uvicorn app.main:app --reload --port 8000
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import chat, healthcare
from app.config import settings

app = FastAPI(title="Sakhi API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api")
app.include_router(healthcare.router, prefix="/api")

# ---- Member 2: include core routers here --------------------------------
# from app.api import health, symptoms, reminders, reports
# app.include_router(health.router, prefix="/api")
# --------------------------------------------------------------------------


@app.get("/api/ping")
def ping():
    return {"status": "ok", "llm_configured": bool(settings.anthropic_api_key)}
