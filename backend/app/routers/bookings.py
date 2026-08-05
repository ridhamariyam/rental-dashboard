from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.booking import (
    BookingCreate,
    BookingUpdate,
)
from app.services.booking_service import BookingService

router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"]
)


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
