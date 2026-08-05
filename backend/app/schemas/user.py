from typing import Optional
from pydantic import BaseModel, EmailStr
from uuid import UUID


class UserShopResponse(BaseModel):
    id: UUID
    name: str
    email: str
    phone: str

    class Config:
        from_attributes = True


class UserCreate(BaseModel):

    first_name: str
    last_name: str
    username: str
    email: EmailStr
    phone: str
    address: Optional[str] = None
    password: str
    role: str
    shop_id: Optional[str] = None


class UserUpdate(BaseModel):
    first_name: str
    last_name: str
    username: str
    email: EmailStr
    phone: str
    address: Optional[str] = None
    role: str
    shop_id: Optional[str] = None
    password: Optional[str] = None


class UserResponse(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    username: str
    email: str
    phone: str
    address: Optional[str] = None
    role: str
    shop_id: Optional[UUID] = None
    shop: Optional[UserShopResponse] = None

    class Config:
        from_attributes = True

        
class UserLogin(BaseModel):
    email: EmailStr
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str
