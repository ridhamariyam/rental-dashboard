import uuid

from sqlalchemy import Boolean, Float, ForeignKey, Integer, JSON, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import TimestampMixin


class ProductVariation(Base, TimestampMixin):
    __tablename__ = "product_variations"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    color: Mapped[str | None] = mapped_column(String(50), nullable=True)
    size: Mapped[str | None] = mapped_column(String(50), nullable=True)
    rent_price: Mapped[float] = mapped_column(Float, nullable=False)
    security_deposit: Mapped[float] = mapped_column(Float, default=0)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    sku: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    barcode: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    barcode_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    gallery: Mapped[list | None] = mapped_column(JSON, nullable=True)

    product = relationship("Product")
