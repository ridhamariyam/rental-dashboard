from datetime import datetime, timezone

from fastapi import HTTPException

from app.core.enums import UserRole
from app.models.attendance import Attendance
from app.models.user import User
from app.repositories.attendance_repository import AttendanceRepository
from app.repositories.user_repository import UserRepository
from app.utils.geocoding import reverse_geocode


class AttendanceService:
    @staticmethod
    def _is_super_admin(user: User) -> bool:
        role = user.role.value if hasattr(user.role, "value") else user.role
        return role == UserRole.SUPER_ADMIN.value

    @staticmethod
    def _ensure_staff_access(current_user: User, staff: User):
        if AttendanceService._is_super_admin(current_user):
            return

        if not current_user.shop_id or str(staff.shop_id) != str(current_user.shop_id):
            raise HTTPException(status_code=404, detail="Staff not found")

    @staticmethod
    def check_in(db, current_user: User, data):
        today = datetime.now(timezone.utc).date()
        existing = AttendanceRepository.get_by_staff_and_date(db, current_user.id, today)

        if existing:
            raise HTTPException(status_code=400, detail="Already checked in today")

        attendance = Attendance(
            staff_id=current_user.id,
            date=today,
            check_in_time=datetime.now(timezone.utc),
            check_in_latitude=data.latitude,
            check_in_longitude=data.longitude,
            check_in_address=reverse_geocode(data.latitude, data.longitude),
        )

        return AttendanceRepository.create(db, attendance)

    @staticmethod
    def check_out(db, current_user: User, data):
        today = datetime.now(timezone.utc).date()
        attendance = AttendanceRepository.get_by_staff_and_date(db, current_user.id, today)

        if not attendance:
            raise HTTPException(status_code=400, detail="No check-in found for today")

        if attendance.check_out_time is not None:
            raise HTTPException(status_code=400, detail="Already checked out today")

        attendance.check_out_time = datetime.now(timezone.utc)
        attendance.check_out_latitude = data.latitude
        attendance.check_out_longitude = data.longitude
        attendance.check_out_address = reverse_geocode(data.latitude, data.longitude)

        return AttendanceRepository.update(db, attendance)

    @staticmethod
    def get_my_attendance(db, current_user: User):
        return AttendanceRepository.get_by_staff(db, current_user.id)

    @staticmethod
    def get_staff_attendance(db, staff_id, current_user: User):
        staff = UserRepository.get_by_id(db, staff_id)
        if not staff:
            raise HTTPException(status_code=404, detail="Staff not found")

        AttendanceService._ensure_staff_access(current_user, staff)

        return AttendanceRepository.get_by_staff(db, staff_id)
