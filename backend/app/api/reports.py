"""Medical-report upload/list/retrieve/delete. Files are stored outside public static dirs.

AI report explanation / OCR is intentionally NOT implemented here; a comment marks the
clean extension point where such a service would be wired in.
"""
import os
import shutil
import uuid
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

import app.auth as auth
from app.config import settings
from app.database import get_db
from app.models import MedicalReport
from app.schemas.reports import MedicalReportOut, ReportListItem

router = APIRouter(prefix="/reports", tags=["reports"])

# Allowed file types and the corresponding media types for serving.
ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}
MEDIA_TYPE_BY_EXT = {
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
}

UPLOAD_ROOT = Path(settings.upload_dir)
UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)


def _safe_filename(original_filename: str) -> str:
    """Generate a collision-safe, traversal-safe stored filename."""
    suffix = Path(original_filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"file_type_not_allowed (allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))})",
        )
    return f"{uuid.uuid4().hex}{suffix}"


def _get_report_or_404(db: Session, report_id: str, user_id: str) -> MedicalReport:
    report = (
        db.query(MedicalReport)
        .filter(MedicalReport.id == report_id, MedicalReport.user_id == user_id)
        .first()
    )
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="report_not_found")
    return report


@router.post("/upload", response_model=MedicalReportOut, status_code=status.HTTP_201_CREATED)
async def upload_report(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(auth.current_user),
):
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="filename_required")

    # Read and enforce size limit before writing anything to disk.
    contents = await file.read()
    max_bytes = settings.max_upload_mb * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"file_too_large (max {settings.max_upload_mb} MB)",
        )
    if len(contents) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="empty_file")

    stored_name = _safe_filename(file.filename)
    stored_path = UPLOAD_ROOT / stored_name

    # Write to a temp name then atomic-ish move to avoid partial files.
    tmp_path = stored_path.with_suffix(stored_path.suffix + ".tmp")
    try:
        tmp_path.write_bytes(contents)
        tmp_path.replace(stored_path)
    except OSError:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="storage_error")

    report = MedicalReport(
        id=auth.new_id(),
        user_id=user.id,
        filename=stored_name,
        original_filename=file.filename,
        file_type=file.content_type or MEDIA_TYPE_BY_EXT.get(Path(file.filename).suffix.lower(), "application/octet-stream"),
        file_size=len(contents),
        file_path=str(stored_path),
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("", response_model=list[ReportListItem])
def list_reports(
    db: Session = Depends(get_db),
    user=Depends(auth.current_user),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    return (
        db.query(MedicalReport)
        .filter(MedicalReport.user_id == user.id)
        .order_by(MedicalReport.uploaded_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.get("/{report_id}", response_model=MedicalReportOut)
def get_report(
    report_id: str,
    db: Session = Depends(get_db),
    user=Depends(auth.current_user),
):
    return _get_report_or_404(db, report_id, user.id)


@router.get("/{report_id}/file")
def download_report(
    report_id: str,
    db: Session = Depends(get_db),
    user=Depends(auth.current_user),
):
    report = _get_report_or_404(db, report_id, user.id)
    path = Path(report.file_path)
    if not path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="file_not_on_disk")
    return FileResponse(
        path,
        media_type=report.file_type,
        filename=report.original_filename,
    )


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(
    report_id: str,
    db: Session = Depends(get_db),
    user=Depends(auth.current_user),
):
    report = _get_report_or_404(db, report_id, user.id)
    # Remove the stored file if present (ignore missing file).
    try:
        Path(report.file_path).unlink(missing_ok=True)
    except OSError:
        pass
    db.delete(report)
    db.commit()
    return None


# TODO(extension): AI report explanation / OCR.
# Wire a service here that takes `report.file_path` and returns a plain-language
# summary. The service MUST be framed as general information, never a diagnosis,
# and must be clearly labelled as AI-generated. Until such a service is configured,
# no explanation/OCR endpoint is exposed and no claim is made that reports are
# interpreted automatically.
