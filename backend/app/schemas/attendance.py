from pydantic import BaseModel


class AttendanceCheckIn(BaseModel):
    latitude: float
    longitude: float


class AttendanceCheckOut(BaseModel):
    latitude: float
    longitude: float
