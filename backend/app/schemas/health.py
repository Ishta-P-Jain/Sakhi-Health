"""Schemas for health tracking (cycle logs + symptom logs)."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

FLOW_LEVELS = ("light", "medium", "heavy")
SEVERITIES = ("mild", "moderate", "severe")


class HealthLogBase(BaseModel):
    cycle_start_date: str | None = Field(default=None, max_length=10)
    cycle_end_date: str | None = Field(default=None, max_length=10)
    flow_level: str | None = Field(default=None, max_length=20)
    notes: str | None = Field(default=None, max_length=2000)

    @field_validator("cycle_start_date", "cycle_end_date", mode="before")
    @classmethod
    def _empty_to_none(cls, v):
        if v == "":
            return None
        return v

    @field_validator("flow_level")
    @classmethod
    def _validate_flow(cls, v):
        if v is not None and v not in FLOW_LEVELS:
            raise ValueError("flow_level must be one of light, medium, heavy")
        return v


class HealthLogCreate(HealthLogBase):
    pass


class HealthLogUpdate(BaseModel):
    cycle_start_date: str | None = Field(default=None, max_length=10)
    cycle_end_date: str | None = Field(default=None, max_length=10)
    flow_level: str | None = Field(default=None, max_length=20)
    notes: str | None = Field(default=None, max_length=2000)

    @field_validator("flow_level")
    @classmethod
    def _validate_flow(cls, v):
        if v is not None and v not in FLOW_LEVELS:
            raise ValueError("flow_level must be one of light, medium, heavy")
        return v


class HealthLogOut(HealthLogBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SymptomLogBase(BaseModel):
    symptom: str = Field(min_length=1, max_length=200)
    severity: str = Field(min_length=1, max_length=20)
    notes: str | None = Field(default=None, max_length=2000)
    occurred_at: datetime

    @field_validator("symptom")
    @classmethod
    def _not_blank(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("symptom must not be blank")
        return v

    @field_validator("severity")
    @classmethod
    def _validate_severity(cls, v):
        v = v.strip().lower()
        if v not in SEVERITIES:
            raise ValueError("severity must be one of mild, moderate, severe")
        return v


class SymptomLogCreate(SymptomLogBase):
    pass


class SymptomLogUpdate(BaseModel):
    symptom: str | None = Field(default=None, min_length=1, max_length=200)
    severity: str | None = Field(default=None, min_length=1, max_length=20)
    notes: str | None = Field(default=None, max_length=2000)
    occurred_at: datetime | None = None

    @field_validator("symptom")
    @classmethod
    def _not_blank(cls, v):
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("symptom must not be blank")
        return v

    @field_validator("severity")
    @classmethod
    def _validate_severity(cls, v):
        if v is not None:
            v = v.strip().lower()
            if v not in SEVERITIES:
                raise ValueError("severity must be one of mild, moderate, severe")
        return v


class SymptomLogOut(SymptomLogBase):
    id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True
