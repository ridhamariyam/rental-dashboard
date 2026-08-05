from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.attendance import AttendanceCheckIn, AttendanceCheckOut
from app.services.attendance_service import AttendanceService

router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"]
)


@router.post("/check-in")
def check_in(
    data: AttendanceCheckIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return AttendanceService.check_in(db, current_user, data)


@router.post("/check-out")
def check_out(
    data: AttendanceCheckOut,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return AttendanceService.check_out(db, current_user, data)


@router.get("/me")
def get_my_attendance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return AttendanceService.get_my_attendance(db, current_user)


@router.get("/staff/{staff_id}")
def get_staff_attendance(
    staff_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return AttendanceService.get_staff_attendance(db, staff_id, current_user)
