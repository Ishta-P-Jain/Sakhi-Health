"""Database setup: SQLAlchemy engine, session factory, and Base.

DATABASE_URL (env) selects the backend. Defaults to a local SQLite file so the
demo runs without any external database. Set DATABASE_URL=postgresql+psycopg2://...
for PostgreSQL deployments.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import settings

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if settings.database_url.startswith("sqlite") else {},
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Yield a SQLAlchemy session and close it when the request ends."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables. Intended for dev/demo; use Alembic migrations in production."""
    Base.metadata.create_all(bind=engine)
