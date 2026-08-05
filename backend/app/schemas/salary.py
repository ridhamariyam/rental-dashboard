from datetime import date
from typing import Optional

from pydantic import BaseModel


class SalaryCreate(BaseModel):
    staff_id: str
    amount: float
    effective_date: date
    note: Optional[str] = None


class SalaryUpdate(BaseModel):
    amount: float
    effective_date: date
    note: Optional[str] = None
