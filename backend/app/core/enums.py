import enum
class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    CUSTOMER = "customer"
    STAFF = "staff"
    ADMIN = "admin"




class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PICKED = "picked"
    RETURNED = "returned"
    CANCELLED = "cancelled"


class LeaveStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class ReturnCondition(str, enum.Enum):
    DAMAGED = "damaged"
    APPROVED = "approved"
    CLEAN = "clean"
