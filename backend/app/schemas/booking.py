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
    status: str


class BookingResponse(BaseModel):
    id: str
    booking_number: str
    status: str

    class Config:
        from_attributes = True
