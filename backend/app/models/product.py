import uuid
from sqlalchemy import (String,Text,Integer,Float,Boolean,ForeignKey,JSON,)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.base import TimestampMixin


class Product(Base, TimestampMixin):
    __tablename__ = "products"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    shop_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True),ForeignKey("shops.id"),nullable=False)
    category_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True),ForeignKey("categories.id"),nullable=False)
    name: Mapped[str] = mapped_column(String(200),nullable=False)
    description: Mapped[str | None] = mapped_column(Text,nullable=True)
    rent_price: Mapped[float] = mapped_column(Float,nullable=False)
    security_deposit: Mapped[float] = mapped_column(Float,default=0)
    quantity: Mapped[int] = mapped_column(Integer,default=1)
    image: Mapped[str | None] = mapped_column(String(500),nullable=True)
    sku: Mapped[str] = mapped_column(String(100),unique=True,nullable=False)
    barcode: Mapped[str] = mapped_column(String(50),unique=True,nullable=False)
    barcode_image: Mapped[str | None] = mapped_column(String(500),nullable=True)
    is_available: Mapped[bool] = mapped_column(Boolean,default=True)
    gallery: Mapped[list | None] = mapped_column(JSON,nullable=True)

   

 

    shop = relationship("Shop")
    category = relationship("Category")