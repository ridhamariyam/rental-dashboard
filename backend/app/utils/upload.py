from __future__ import annotations

import mimetypes
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

UPLOAD_ROOT = Path(__file__).resolve().parents[2] / "uploads"


def _build_filename(file: UploadFile) -> str:
    original_name = file.filename or ""
    suffix = Path(original_name).suffix

    if not suffix and file.content_type:
        guessed_suffix = mimetypes.guess_extension(file.content_type)
        suffix = guessed_suffix or ""

    return f"{uuid4().hex}{suffix}"


async def save_upload(file: UploadFile, subdirectory: str = "products") -> str:
    destination_dir = UPLOAD_ROOT / subdirectory
    destination_dir.mkdir(parents=True, exist_ok=True)

    filename = _build_filename(file)
    destination = destination_dir / filename

    contents = await file.read()
    destination.write_bytes(contents)
    await file.close()

    return f"/uploads/{subdirectory}/{filename}"


async def save_uploads(files: list[UploadFile], subdirectory: str = "products") -> list[str]:
    saved_files: list[str] = []

    for file in files:
        saved_files.append(await save_upload(file, subdirectory))

    return saved_files
