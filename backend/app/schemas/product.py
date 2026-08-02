from typing import Optional

from pydantic import BaseModel


class ProductCreate(BaseModel):

    shop_id: Optional[str] = None
    category_id: str
    name: str
    description: Optional[str] = None
    image: Optional[str] = None
    gallery: Optional[list] = None
    rent_price: float
    security_deposit: float
    quantity: int
    available_quantity: int


class ProductUpdate(BaseModel):

    shop_id: Optional[str] = None
    category_id: str
    name: str
    description: Optional[str] = None
    image: Optional[str] = None
    gallery: Optional[list] = None
    rent_price: float
    security_deposit: float
    quantity: int


class ProductResponse(BaseModel):

    id: str
    sku: str
    barcode: str
    name: str

    class Config:
        from_attributes = True
