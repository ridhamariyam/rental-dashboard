import uuid
from sqlalchemy import (String,Text,ForeignKey,)
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
    image: Mapped[str | None] = mapped_column(String(500),nullable=True)

    shop = relationship("Shop")
    category = relationship("Category")