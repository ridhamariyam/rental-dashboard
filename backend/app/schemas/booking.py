from datetime import date
from typing import Optional
from pydantic import BaseModel


class BookingCreate(BaseModel):
    user_id: str
    shop_id: Optional[str] = None
    product_id: str
    from_date: date
    to_date: date


class BookingUpdate(BaseModel):
    product_id: Optional[str] = None
    variation_id: Optional[str] = None
    from_date: Optional[date] = None
    to_date: Optional[date] = None
    security_deposit: Optional[float] = None
    status: Optional[str] = None


class BookingAssignCreate(BaseModel):
    user_id: str
    from_date: date
    to_date: date
    security_deposit: Optional[float] = None
    status: Optional[str] = None


class BookingResponse(BaseModel):
    id: str
    booking_number: str
    status: str

    class Config:
        from_attributes = True


class BookingReturn(BaseModel):
    return_condition: str
    damage_notes: Optional[str] = None
    return_image: Optional[str] = None
