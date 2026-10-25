"""Schemas for medication and preventive-care reminders."""
from datetime import datetime

from pydantic import BaseModel, Field, field_validator

KINDS = ("medication", "preventive_care")
FREQUENCIES = ("daily", "weekly", "monthly", "custom")


class ReminderBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    kind: str = Field(min_length=1, max_length=30)
    frequency: str = Field(min_length=1, max_length=30)
    time_of_day: str | None = Field(default=None, max_length=8)  # HH:MM
    active: bool = True

    @field_validator("kind")
    @classmethod
    def _validate_kind(cls, v):
        v = v.strip().lower()
        if v not in KINDS:
            raise ValueError("kind must be one of medication, preventive_care")
        return v

    @field_validator("frequency")
    @classmethod
    def _validate_frequency(cls, v):
        v = v.strip().lower()
        if v not in FREQUENCIES:
            raise ValueError("frequency must be one of daily, weekly, monthly, custom")
        return v


class ReminderCreate(ReminderBase):
    pass


class ReminderUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    kind: str | None = Field(default=None, min_length=1, max_length=30)
    frequency: str | None = Field(default=None, min_length=1, max_length=30)
    time_of_day: str | None = Field(default=None, max_length=8)
    active: bool | None = None
    last_taken: datetime | None = None

    @field_validator("kind")
    @classmethod
    def _validate_kind(cls, v):
        if v is not None:
            v = v.strip().lower()
            if v not in KINDS:
                raise ValueError("kind must be one of medication, preventive_care")
        return v

    @field_validator("frequency")
    @classmethod
    def _validate_frequency(cls, v):
        if v is not None:
            v = v.strip().lower()
            if v not in FREQUENCIES:
                raise ValueError("frequency must be one of daily, weekly, monthly, custom")
        return v


class ReminderOut(ReminderBase):
    id: str
    user_id: str
    last_taken: datetime | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class ReminderMarkTaken(BaseModel):
    last_taken: datetime
