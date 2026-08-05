from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.booking import (
    BookingCreate,
    BookingReturn,
    BookingUpdate,
)
from app.services.booking_service import BookingService
from app.utils.upload import save_upload

router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"]
)


def _is_uploaded_file(value: object) -> bool:
    return hasattr(value, "filename") and hasattr(value, "read")


async def _parse_return_payload(request: Request) -> dict[str, object]:
    content_type = request.headers.get("content-type", "")

    if "multipart/form-data" not in content_type:
        return await request.json()

    form = await request.form()
    payload: dict[str, object] = {}

    for key, value in form.multi_items():
        if key == "image":
            continue
        if key not in payload:
            payload[key] = value

    image = form.get("image")
    if _is_uploaded_file(image) and getattr(image, "filename", None):
        payload["return_image"] = await save_upload(image, "returns")

    return payload


@router.post("/")
def create_booking(
    booking: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    return BookingService.create_booking(db, booking, current_user)


@router.get("/")
def get_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return BookingService.get_bookings(db, current_user)


@router.get("/customer/{user_id}")
def get_bookings_for_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return BookingService.get_bookings_for_user(db, user_id, current_user)


@router.get("/{booking_id}")
def get_booking(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    return BookingService.get_booking(
        db,
        booking_id,
        current_user
    )


@router.put("/{booking_id}")
def update_booking(
    booking_id: str,
    booking: BookingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    result = BookingService.update_booking(db, booking_id, booking, current_user)
    if not result:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    return result


@router.post("/{booking_id}/return")
async def return_booking(
    booking_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    payload = await _parse_return_payload(request)
    data = BookingReturn.model_validate(payload)
    return BookingService.return_booking(db, booking_id, data, current_user)


@router.delete("/{booking_id}")
def delete_booking(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    result = BookingService.delete_booking(db, booking_id, current_user)
    if not result:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    return {
        "message": "Booking deleted successfully"
    }
