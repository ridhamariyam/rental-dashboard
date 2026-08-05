from fastapi import HTTPException

from app.core.enums import UserRole
from app.models.salary import Salary
from app.models.user import User
from app.repositories.salary_repository import SalaryRepository
from app.repositories.user_repository import UserRepository


class SalaryService:
    @staticmethod
    def _is_super_admin(user: User) -> bool:
        role = user.role.value if hasattr(user.role, "value") else user.role
        return role == UserRole.SUPER_ADMIN.value

    @staticmethod
    def _is_admin(user: User) -> bool:
        role = user.role.value if hasattr(user.role, "value") else user.role
        return role in {UserRole.SUPER_ADMIN.value, UserRole.ADMIN.value}

    @staticmethod
    def _ensure_staff_view_access(current_user: User, staff: User):
        if SalaryService._is_super_admin(current_user):
            return

        if str(current_user.id) == str(staff.id):
            return

        if not current_user.shop_id or str(staff.shop_id) != str(current_user.shop_id):
            raise HTTPException(status_code=404, detail="Staff not found")

    @staticmethod
    def _ensure_manage_access(current_user: User, staff: User):
        if not SalaryService._is_admin(current_user):
            raise HTTPException(status_code=403, detail="Only admins can manage salary records")

        if not SalaryService._is_super_admin(current_user):
            if not current_user.shop_id or str(staff.shop_id) != str(current_user.shop_id):
                raise HTTPException(status_code=404, detail="Staff not found")

    @staticmethod
    def create_salary(db, data, current_user: User):
        staff = UserRepository.get_by_id(db, data.staff_id)
        if not staff:
            raise HTTPException(status_code=404, detail="Staff not found")
        SalaryService._ensure_manage_access(current_user, staff)

        salary = Salary(
            staff_id=data.staff_id,
            amount=data.amount,
            effective_date=data.effective_date,
            note=data.note,
        )

        return SalaryRepository.create(db, salary)

    @staticmethod
    def get_staff_salaries(db, staff_id, current_user: User):
        staff = UserRepository.get_by_id(db, staff_id)
        if not staff:
            raise HTTPException(status_code=404, detail="Staff not found")
        SalaryService._ensure_staff_view_access(current_user, staff)

        return SalaryRepository.get_by_staff(db, staff_id)

    @staticmethod
    def update_salary(db, salary_id, data, current_user: User):
        salary = SalaryRepository.get_by_id(db, salary_id)
        if not salary:
            return None

        staff = UserRepository.get_by_id(db, str(salary.staff_id))
        SalaryService._ensure_manage_access(current_user, staff)

        salary.amount = data.amount
        salary.effective_date = data.effective_date
        salary.note = data.note

        return SalaryRepository.update(db, salary)

    @staticmethod
    def delete_salary(db, salary_id, current_user: User):
        salary = SalaryRepository.get_by_id(db, salary_id)
        if not salary:
            return False

        staff = UserRepository.get_by_id(db, str(salary.staff_id))
        SalaryService._ensure_manage_access(current_user, staff)

        SalaryRepository.delete(db, salary)
        return True
