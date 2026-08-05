from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.salary import SalaryCreate, SalaryUpdate
from app.services.salary_service import SalaryService

router = APIRouter(
    prefix="/salaries",
    tags=["Salary"]
)


@router.post("/")
def create_salary(
    salary: SalaryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return SalaryService.create_salary(db, salary, current_user)


@router.get("/staff/{staff_id}")
def get_staff_salaries(
    staff_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return SalaryService.get_staff_salaries(db, staff_id, current_user)


@router.put("/{salary_id}")
def update_salary(
    salary_id: str,
    salary: SalaryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = SalaryService.update_salary(db, salary_id, salary, current_user)
    if not result:
        raise HTTPException(status_code=404, detail="Salary record not found")
    return result


@router.delete("/{salary_id}")
def delete_salary(
    salary_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = SalaryService.delete_salary(db, salary_id, current_user)
    if not result:
        raise HTTPException(status_code=404, detail="Salary record not found")
    return {"message": "Salary record deleted successfully"}
