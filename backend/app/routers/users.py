from fastapi import APIRouter, HTTPException
from fastapi import Depends
from sqlalchemy.orm import Session
from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.user import RefreshTokenRequest, UserCreate, UserLogin, UserUpdate
from app.services.user_service import UserService,AuthService



router = APIRouter(prefix="/users",tags=["Users"])


@router.get("/")
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return UserService.get_users(db, current_user)


@router.get("/{user_id}")
def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return UserService.get_user(db, user_id, current_user)


@router.post("/register")
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return UserService.create_user(db, user, current_user)


@router.put("/{user_id}")
def update_user(
    user_id: str,
    user: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = UserService.update_user(db, user_id, user, current_user)
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    return result


@router.delete("/{user_id}")
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = UserService.delete_user(db, user_id, current_user)
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

@router.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):
    return AuthService.login(db, user)


@router.post("/refresh-token")
def refresh_token(
    data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    return AuthService.refresh_access_token(db, data.refresh_token)
