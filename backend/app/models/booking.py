import uuid
from datetime import date
from sqlalchemy import (String,Date,Float,ForeignKey,Enum,)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.base import TimestampMixin
from app.core.enums import BookingStatus
class Booking(Base, TimestampMixin):
    __tablename__ = "bookings"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    booking_number: Mapped[str] = mapped_column(String(30),unique=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True),ForeignKey("users.id"))
    shop_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True),ForeignKey("shops.id"))
    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True),ForeignKey("products.id"))
    variation_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True),ForeignKey("product_variations.id"),nullable=True)
    from_date: Mapped[date] = mapped_column(Date)
    to_date: Mapped[date] = mapped_column(Date)
    total_days: Mapped[int]
    rent_amount: Mapped[float] = mapped_column(Float)
    security_deposit: Mapped[float] = mapped_column(Float)
    total_amount: Mapped[float] = mapped_column(Float)
    status: Mapped[BookingStatus] = mapped_column(Enum(BookingStatus,values_callable=lambda x: [e.value for e in x],name="booking_status",),default=BookingStatus.PENDING)
    
    user = relationship("User")
    shop = relationship("Shop")
    product = relationship("Product")
    variation = relationship("ProductVariation")