import json

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.booking import BookingAssignCreate
from app.schemas.product_variation import ProductVariationCreate, ProductVariationUpdate
from app.services.booking_service import BookingService
from app.services.product_variation_service import ProductVariationService
from app.utils.upload import save_upload

router = APIRouter(
    prefix="/variations",
    tags=["Product Variations"]
)


def _is_uploaded_file(value: object) -> bool:
    return hasattr(value, "filename") and hasattr(value, "read")


async def _parse_variation_payload(request: Request) -> dict[str, object]:
    content_type = request.headers.get("content-type", "")

    if "multipart/form-data" not in content_type:
        return await request.json()

    form = await request.form()
    payload: dict[str, object] = {}

    for key, value in form.multi_items():
        if key == "gallery":
            continue

        if key not in payload:
            payload[key] = value

    gallery_values = form.getlist("gallery")
    saved_gallery: list[object] = []

    for item in gallery_values:
        if _is_uploaded_file(item) and getattr(item, "filename", None):
            saved_gallery.append(await save_upload(item, "products"))
        elif isinstance(item, str) and item.strip():
            if len(gallery_values) == 1:
                try:
                    parsed_gallery = json.loads(item)
                except json.JSONDecodeError:
                    saved_gallery.append(item)
                else:
                    if isinstance(parsed_gallery, list):
                        saved_gallery.extend(parsed_gallery)
                    else:
                        saved_gallery.append(parsed_gallery)
            else:
                saved_gallery.append(item)

    if saved_gallery:
        payload["gallery"] = saved_gallery

    return payload


@router.post("/")
async def create_variation(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    payload = await _parse_variation_payload(request)
    data = ProductVariationCreate.model_validate(payload)
    return ProductVariationService.create_variation(db, data, current_user)


@router.get("/")
def get_variations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ProductVariationService.get_variations(db, current_user)


@router.get("/{variation_id}")
def get_variation(
    variation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ProductVariationService.get_variation(db, variation_id, current_user)


@router.put("/{variation_id}")
async def update_variation(
    variation_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    payload = await _parse_variation_payload(request)
    data = ProductVariationUpdate.model_validate(payload)
    result = ProductVariationService.update_variation(db, variation_id, data, current_user)

    if not result:
        raise HTTPException(status_code=404, detail="Variation not found")

    return result


@router.post("/{variation_id}/assign")
def assign_variation(
    variation_id: str,
    data: BookingAssignCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return BookingService.assign_variation(db, variation_id, data, current_user)


@router.delete("/{variation_id}")
def delete_variation(
    variation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ProductVariationService.delete_variation(db, variation_id, current_user)
    return {"message": "Variation deleted successfully"}
