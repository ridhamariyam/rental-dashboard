from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.staff_leave import (StaffLeaveCreate,StaffLeaveUpdate)
from app.services.staff_leave_service import (StaffLeaveService)

router = APIRouter(
    prefix="/staff-leaves",
    tags=["Staff Leave"]
)


@router.post("/")
def create_leave(
    leave: StaffLeaveCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return StaffLeaveService.create_leave(
        db,
        leave,
        current_user
    )


@router.get("/")
def get_leaves(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return StaffLeaveService.get_leaves(db, current_user)


@router.put("/{leave_id}")
def update_leave(
    leave_id: str,
    leave: StaffLeaveUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    result = StaffLeaveService.update_leave(
        db,
        leave_id,
        leave,
        current_user
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Leave not found"
        )

    return result


@router.delete("/{leave_id}")
def delete_leave(
    leave_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    result = StaffLeaveService.delete_leave(
        db,
        leave_id,
        current_user
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Leave not found"
        )

    return {
        "message": "Leave deleted successfully"
    }
