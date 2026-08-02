import uuid
from sqlalchemy import String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import TimestampMixin
from app.database import Base


class Shop(Base,TimestampMixin):
    __tablename__ = "shops"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(150),nullable=False)
    email: Mapped[str] = mapped_column(String(255),unique=True,nullable=False)
    phone: Mapped[str] = mapped_column( String(20),unique=True,nullable=False)
    address: Mapped[str] = mapped_column(Text,nullable=False)
    description: Mapped[str | None] = mapped_column(Text,nullable=True)
    logo: Mapped[str | None] = mapped_column(String(500),nullable=True)

  
