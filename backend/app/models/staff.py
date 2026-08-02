import uuid
import enum
from sqlalchemy import (String,Text, Date,Enum,ForeignKey,)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import (Mapped,mapped_column,relationship,)
from app.database import Base
from app.models.base  import TimestampMixin
from app.core.enums import LeaveStatus




class StaffLeave(Base, TimestampMixin):
    __tablename__ = "staff_leaves"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    staff_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True),ForeignKey("users.id"))
    from_date: Mapped[Date] = mapped_column(Date)
    to_date: Mapped[Date] = mapped_column(Date)
    reason: Mapped[str] = mapped_column(Text)
    status: Mapped[LeaveStatus] = mapped_column(Enum(LeaveStatus,values_callable=lambda x: [e.value for e in x],name="leave_status"),default=LeaveStatus.PENDING)
    staff = relationship("User")