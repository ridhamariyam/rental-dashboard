from datetime import date
from pydantic import BaseModel


class StaffLeaveCreate(BaseModel):
    staff_id: str
    from_date: date
    to_date: date
    reason: str


class StaffLeaveUpdate(BaseModel):
    status: str


class StaffLeaveResponse(BaseModel):
    id: str
    staff_id: str
    status: str

    class Config:
        from_attributes = True