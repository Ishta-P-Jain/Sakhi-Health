"""SQLAlchemy models for the Sakhi backend."""
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.database import Base


def _now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=_now, nullable=False)

    health_logs = relationship("HealthLog", back_populates="user", cascade="all, delete-orphan")
    symptom_logs = relationship("SymptomLog", back_populates="user", cascade="all, delete-orphan")
    reminders = relationship("Reminder", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("MedicalReport", back_populates="user", cascade="all, delete-orphan")


class HealthLog(Base):
    """Menstrual-cycle / general health log entries owned by a user."""
    __tablename__ = "health_logs"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    cycle_start_date = Column(String(10), nullable=True)  # ISO date string
    cycle_end_date = Column(String(10), nullable=True)    # ISO date string
    flow_level = Column(String(20), nullable=True)        # light | medium | heavy
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=_now, nullable=False)
    updated_at = Column(DateTime, default=_now, onupdate=_now, nullable=False)

    user = relationship("User", back_populates="health_logs")


class SymptomLog(Base):
    """Symptom records with severity and notes, owned by a user. No diagnosis inferred."""
    __tablename__ = "symptom_logs"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    symptom = Column(String(200), nullable=False)
    severity = Column(String(20), nullable=False)  # mild | moderate | severe
    notes = Column(Text, nullable=True)
    occurred_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=_now, nullable=False)

    user = relationship("User", back_populates="symptom_logs")


class Reminder(Base):
    """Medication / preventive-care reminders owned by a user."""
    __tablename__ = "reminders"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    kind = Column(String(30), nullable=False)  # medication | preventive_care
    frequency = Column(String(30), nullable=False)  # daily | weekly | monthly | custom
    time_of_day = Column(String(8), nullable=True)  # HH:MM
    active = Column(Boolean, default=True, nullable=False)
    last_taken = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=_now, nullable=False)

    user = relationship("User", back_populates="reminders")


class MedicalReport(Base):
    """Medical-report metadata. The file itself is stored on disk outside public static dirs."""
    __tablename__ = "medical_reports"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)      # safe stored name
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False)
    uploaded_at = Column(DateTime, default=_now, nullable=False)

    user = relationship("User", back_populates="reports")
