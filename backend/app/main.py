
"""FastAPI entry point for Sakhi Health."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import database
from app.api import auth, chat, healthcare, health, reminders, reports, symptoms
from app.config import settings
from app.services.llm import OLLAMA_BASE_URL, OLLAMA_MODEL


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize the database when the application starts."""
    database.init_db()
    yield


app = FastAPI(
    title="Sakhi API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Member 3: AI chat and healthcare finder
app.include_router(chat.router, prefix="/api")
app.include_router(healthcare.router, prefix="/api")

# Member 2: authentication and health features
app.include_router(auth.router, prefix="/api")
app.include_router(health.router, prefix="/api")
app.include_router(symptoms.router, prefix="/api")
app.include_router(reminders.router, prefix="/api")
app.include_router(reports.router, prefix="/api")


@app.get("/api/ping")
def ping():
    """Check API status and local LLM configuration."""
    return {
        "status": "ok",
        "llm_configured": bool(OLLAMA_BASE_URL and OLLAMA_MODEL),
    }
