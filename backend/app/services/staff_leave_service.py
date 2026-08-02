from fastapi import HTTPException

from app.core.enums import UserRole
from app.models.staff import StaffLeave
from app.models.user import User
from app.repositories.staff_leave_repository import StaffLeaveRepository
from app.repositories.user_repository import UserRepository

class StaffLeaveService:
    @staticmethod
    def _is_super_admin(user: User) -> bool:
        role = user.role.value if hasattr(user.role, "value") else user.role
        return role == UserRole.SUPER_ADMIN.value

    @staticmethod
    def _ensure_staff_access(current_user: User, staff: User):
        if StaffLeaveService._is_super_admin(current_user):
            return

        if not current_user.shop_id or str(staff.shop_id) != str(current_user.shop_id):
            raise HTTPException(status_code=404, detail="Staff not found")

    @staticmethod
    def _ensure_leave_access(db, current_user: User, leave: StaffLeave):
        if StaffLeaveService._is_super_admin(current_user):
            return

        staff = UserRepository.get_by_id(db, str(leave.staff_id))
        if not staff or not current_user.shop_id or str(staff.shop_id) != str(current_user.shop_id):
            raise HTTPException(status_code=404, detail="Leave not found")

    @staticmethod
    def create_leave(db, data, current_user: User):
        staff = UserRepository.get_by_id(db, data.staff_id)
        if not staff:
            raise HTTPException(status_code=404, detail="Staff not found")
        StaffLeaveService._ensure_staff_access(current_user, staff)

        leave = StaffLeave(
            staff_id=data.staff_id,
            from_date=data.from_date,
            to_date=data.to_date,
            reason=data.reason
        )

        return StaffLeaveRepository.create(db, leave)

    @staticmethod
    def get_leaves(db, current_user: User):
        if StaffLeaveService._is_super_admin(current_user):
            return StaffLeaveRepository.get_all(db)

        return StaffLeaveRepository.get_by_shop(db, current_user.shop_id)

    @staticmethod
    def update_leave(db, leave_id, data, current_user: User):
        leave = StaffLeaveRepository.get_by_id(db,leave_id)
        if not leave:
            return None
        StaffLeaveService._ensure_leave_access(db, current_user, leave)

        leave.status = data.status

        return StaffLeaveRepository.update(db, leave)

    @staticmethod
    def delete_leave(db, leave_id, current_user: User):
        leave = StaffLeaveRepository.get_by_id(db,leave_id)
        if not leave:
            return False
        StaffLeaveService._ensure_leave_access(db, current_user, leave)
        StaffLeaveRepository.delete(db, leave)

        return True
