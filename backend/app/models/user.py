import uuid
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.core.enums import UserRole
from app.database import Base
from sqlalchemy import Enum
from app.models.shop import Shop

class User(Base):
    __tablename__ = "users"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    username: Mapped[str] = mapped_column(String(100),unique=True,nullable=False)
    email: Mapped[str] = mapped_column(String(255),unique=True,nullable=False,index=True)
    phone: Mapped[str] = mapped_column(String(20),unique=True,nullable=False)
    address: Mapped[str | None] = mapped_column(Text,nullable=True)
    password: Mapped[str] = mapped_column(String(255))
    shop_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("shops.id"), nullable=True)
    profile_image: Mapped[str | None] = mapped_column(String(500),nullable=True)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole,values_callable=lambda enum_cls: [e.value for e in enum_cls],name="user_role",),default=UserRole.CUSTOMER,nullable=False,)
    is_email_verified: Mapped[bool] = mapped_column(Boolean,default=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True),server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True),server_default=func.now(),onupdate=func.now())
    shop: Mapped[Shop | None] = relationship("Shop")
