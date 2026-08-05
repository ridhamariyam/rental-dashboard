from typing import Optional

from pydantic import BaseModel


class ProductCreate(BaseModel):

    shop_id: Optional[str] = None
    category_id: str
    name: str
    description: Optional[str] = None
    image: Optional[str] = None


class ProductUpdate(BaseModel):

    shop_id: Optional[str] = None
    category_id: str
    name: str
    description: Optional[str] = None
    image: Optional[str] = None


class ProductResponse(BaseModel):

    id: str
    name: str

    class Config:
        from_attributes = True
