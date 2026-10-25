"""FastAPI entry point.

Member 3 wires the chat + healthcare routers. Member 2: health, symptoms, reminders,
reports, and auth routers are included below. Run:  uvicorn app.main:app --reload --port 8000
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import database
from app.api import auth, chat, healthcare, health, reminders, reports, symptoms
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

# ---- Member 2: core routers ----------------------------------------------
app.include_router(auth.router, prefix="/api")
app.include_router(health.router, prefix="/api")
app.include_router(symptoms.router, prefix="/api")
app.include_router(reminders.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
# --------------------------------------------------------------------------

# Create tables on startup (dev/demo; use Alembic migrations in production).
@app.on_event("startup")
def _startup():
    database.init_db()


@app.get("/api/ping")
def ping():
    return {"status": "ok", "llm_configured": bool(settings.anthropic_api_key)}
