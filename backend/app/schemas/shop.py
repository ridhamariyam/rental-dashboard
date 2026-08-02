from typing import Optional
from pydantic import BaseModel, EmailStr


class ShopCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    address: str
    description: Optional[str] = None
    logo: Optional[str] = None


class ShopUpdate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    address: str
    description: Optional[str] = None
    logo: Optional[str] = None


class ShopResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: str
    address: str
    description: Optional[str]
    logo: Optional[str]

    class Config:
        from_attributes = True