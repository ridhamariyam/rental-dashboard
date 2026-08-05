from typing import Optional

from pydantic import BaseModel


class ProductVariationCreate(BaseModel):

    product_id: str
    color: Optional[str] = None
    size: Optional[str] = None
    rent_price: float
    security_deposit: float = 0
    quantity: int = 1
    gallery: Optional[list] = None
    is_available: bool = True


class ProductVariationUpdate(BaseModel):

    product_id: str
    color: Optional[str] = None
    size: Optional[str] = None
    rent_price: float
    security_deposit: float = 0
    quantity: int = 1
    gallery: Optional[list] = None
    is_available: bool = True
