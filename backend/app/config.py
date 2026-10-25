"""Environment-driven settings. Read once at import; restart the server after editing .env."""
import os

from dotenv import load_dotenv

load_dotenv()


def _int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, default))
    except ValueError:
        return default


class Settings:
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
    llm_model: str = os.getenv("LLM_MODEL", "claude-haiku-5-5")
    llm_max_tokens: int = _int("LLM_MAX_TOKENS", 500)
    llm_timeout: int = _int("LLM_TIMEOUT_SECONDS", 25)
    geocoder_user_agent: str = os.getenv(
        "GEOCODER_USER_AGENT", "sakhi-hackathon/0.1 (set GEOCODER_USER_AGENT)"
    )
    geocode_country: str = os.getenv("GEOCODE_COUNTRY", "in")
    cors_origins: list[str] = [
        o.strip()
        for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
        if o.strip()
    ]
    chat_rate_limit: int = _int("CHAT_RATE_LIMIT_PER_MINUTE", 20)

    # Database: defaults to a local SQLite file; set DATABASE_URL for PostgreSQL etc.
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./sakhi.db")

    # Auth / JWT
    secret_key: str = os.getenv("SECRET_KEY", "dev-secret-change-me")
    algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    access_token_expire_minutes: int = _int("ACCESS_TOKEN_EXPIRE_MINUTES", 60 * 24 * 7)

    # File storage for medical reports (kept outside public static dirs)
    upload_dir: str = os.getenv("UPLOAD_DIR", "uploads")
    max_upload_mb: int = _int("MAX_UPLOAD_MB", 5)


settings = Settings()
