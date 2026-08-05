from __future__ import annotations

from pathlib import Path
from uuid import uuid4

import barcode as barcode_lib
from barcode.writer import ImageWriter

from app.utils.upload import UPLOAD_ROOT


def generate_barcode_image(barcode_value: str, subdirectory: str = "products") -> str:
    destination_dir = UPLOAD_ROOT / subdirectory
    destination_dir.mkdir(parents=True, exist_ok=True)

    filename = uuid4().hex
    code128 = barcode_lib.get("code128", barcode_value, writer=ImageWriter())
    saved_path = code128.save(str(destination_dir / filename))

    return f"/uploads/{subdirectory}/{Path(saved_path).name}"
