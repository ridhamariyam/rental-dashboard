from sqlalchemy.orm import Session
from app.core.auth import hash_password
from app.core.enums import UserRole
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserLogin,UserResponse
from app.core.auth import (verify_password,create_access_token,create_refresh_token)
from fastapi import HTTPException
from jose import JWTError, jwt
from app.config import settings
from app.utils.response import success_response, error_response


class UserService:
    @staticmethod
    def _role_value(user: User) -> str:
        return user.role.value if hasattr(user.role, "value") else user.role

    @staticmethod
    def _is_super_admin(user: User) -> bool:
        return UserService._role_value(user) == UserRole.SUPER_ADMIN.value

    @staticmethod
    def _ensure_same_shop(current_user: User, shop_id):
        if UserService._is_super_admin(current_user):
            return

        if not current_user.shop_id or str(current_user.shop_id) != str(shop_id):
            raise HTTPException(status_code=403, detail="You do not have access to this shop")

    @staticmethod
    def _serialize_user(user: User):
        return UserResponse.model_validate(user).model_dump(mode="json")

    @staticmethod
    def create_user(db: Session, user: UserCreate, current_user: User):
        current_role = UserService._role_value(current_user)
        requested_role = UserRole(user.role)

        if current_role not in {UserRole.SUPER_ADMIN.value, UserRole.ADMIN.value}:
            raise HTTPException(status_code=403, detail="Only super admin or shop admin can create users")

        if current_role == UserRole.ADMIN.value and requested_role not in {UserRole.STAFF, UserRole.CUSTOMER}:
            raise HTTPException(status_code=403, detail="Shop admin can create only staff or customers")

        shop_id = user.shop_id
        if not UserService._is_super_admin(current_user):
            if not current_user.shop_id:
                raise HTTPException(status_code=400, detail="Current user is not assigned to a shop")
            shop_id = current_user.shop_id
        elif requested_role != UserRole.SUPER_ADMIN and not shop_id:
            raise HTTPException(status_code=400, detail="shop_id is required for shop users")

        existing_email = UserRepository.get_by_email(db, user.email)
        if existing_email:
            return error_response(
                message="Email already exists",
                status_code=400
            )
        existing_phone = UserRepository.get_by_phone(db, user.phone)
        if existing_phone:
            return error_response(
                message="Phone number already exists",
                status_code=400
            )

        new_user = User(
            first_name=user.first_name,
            last_name=user.last_name,
            username=user.username,
            email=user.email,
            phone=user.phone,
            password=hash_password(user.password),
            role=requested_role,
            shop_id=shop_id
        )
        created_user = UserRepository.create(db, new_user)
        user_response = UserService._serialize_user(created_user)


        return success_response(
            data=user_response,
            message="User registered successfully",
            status_code=201
        )

    @staticmethod
    def get_users(db: Session, current_user: User):
        users = (
            UserRepository.get_all(db)
            if UserService._is_super_admin(current_user)
            else UserRepository.get_by_shop(db, current_user.shop_id)
        )
        return [UserService._serialize_user(user) for user in users]

    @staticmethod
    def get_user(db: Session, user_id: str, current_user: User):
        user = UserRepository.get_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        UserService._ensure_same_shop(current_user, user.shop_id)
        return UserService._serialize_user(user)

    @staticmethod
    def update_user(db: Session, user_id: str, data: UserUpdate, current_user: User):
        user = UserRepository.get_by_id(db, user_id)
        if not user:
            return None
        UserService._ensure_same_shop(current_user, user.shop_id)

        requested_role = UserRole(data.role)
        if not UserService._is_super_admin(current_user) and requested_role not in {UserRole.STAFF, UserRole.CUSTOMER}:
            raise HTTPException(status_code=403, detail="Shop admin can update only staff or customers")

        existing_email = UserRepository.get_by_email(db, data.email)
        if existing_email and str(existing_email.id) != user_id:
            raise HTTPException(status_code=400, detail="Email already exists")

        existing_phone = UserRepository.get_by_phone(db, data.phone)
        if existing_phone and str(existing_phone.id) != user_id:
            raise HTTPException(status_code=400, detail="Phone number already exists")

        user.first_name = data.first_name
        user.last_name = data.last_name
        user.username = data.username
        user.email = data.email
        user.phone = data.phone
        user.role = requested_role
        if UserService._is_super_admin(current_user):
            user.shop_id = data.shop_id
        else:
            user.shop_id = current_user.shop_id
        if data.password:
            user.password = hash_password(data.password)

        updated_user = UserRepository.update(db, user)
        return UserService._serialize_user(updated_user)

    @staticmethod
    def delete_user(db: Session, user_id: str, current_user: User):
        user = UserRepository.get_by_id(db, user_id)
        if not user:
            return False
        UserService._ensure_same_shop(current_user, user.shop_id)
        UserRepository.delete(db, user)
        return True
    

    
class AuthService:
    @staticmethod
    def login(db: Session,
        login_data: UserLogin
    ):

        user = UserRepository.get_by_email(
            db,
            login_data.email
        )

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        try:
            password_is_valid = verify_password(
                login_data.password,
                user.password
            )
        except Exception:
            password_is_valid = user.password == login_data.password
            if password_is_valid:
                user.password = hash_password(login_data.password)
                UserRepository.update(db, user)

        if not password_is_valid:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        access_token = create_access_token(
            {
                "sub": str(user.id),
                "email": user.email,
                "role": user.role.value if hasattr(user.role, "value") else user.role,
                "shop_id": str(user.shop_id) if user.shop_id else None
            }
        )

        refresh_token = create_refresh_token(
            {
                "sub": str(user.id)
            }
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "Bearer",
            "user": {
                "id": str(user.id),
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "role": user.role.value if hasattr(user.role, "value") else user.role,
                "shop_id": str(user.shop_id) if user.shop_id else None
            }
        }

    @staticmethod
    def refresh_access_token(db: Session, refresh_token: str):
        try:
            payload = jwt.decode(
                refresh_token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM]
            )
        except JWTError:
            raise HTTPException(
                status_code=401,
                detail="Invalid refresh token"
            )

        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=401,
                detail="Invalid refresh token"
            )

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid refresh token"
            )

        user = UserRepository.get_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=401,
                detail="User not found"
            )

        access_token = create_access_token(
            {
                "sub": str(user.id),
                "email": user.email,
                "role": user.role.value if hasattr(user.role, "value") else user.role,
                "shop_id": str(user.shop_id) if user.shop_id else None
            }
        )

        return {
            "access_token": access_token,
            "token_type": "Bearer"
        }
