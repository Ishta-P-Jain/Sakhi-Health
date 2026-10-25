"""Schemas for medical reports."""
from datetime import datetime

from pydantic import BaseModel, Field


class MedicalReportOut(BaseModel):
    id: str
    user_id: str
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    uploaded_at: datetime

    class Config:
        from_attributes = True


class ReportListItem(BaseModel):
    id: str
    original_filename: str
    file_type: str
    file_size: int
    uploaded_at: datetime

    class Config:
        from_attributes = True
