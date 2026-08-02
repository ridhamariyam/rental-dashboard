import random
from datetime import timedelta

from fastapi import HTTPException

from app.core.enums import UserRole
from app.models.booking import Booking
from app.models.user import User
from app.repositories.booking_repository import BookingRepository
from app.repositories.product_repository import ProductRepository

class BookingService:
    @staticmethod
    def _is_super_admin(user: User) -> bool:
        role = user.role.value if hasattr(user.role, "value") else user.role
        return role == UserRole.SUPER_ADMIN.value

    @staticmethod
    def _ensure_booking_access(current_user: User, booking: Booking):
        if BookingService._is_super_admin(current_user):
            return

        if not current_user.shop_id or str(booking.shop_id) != str(current_user.shop_id):
            raise HTTPException(status_code=404, detail="Booking not found")

    @staticmethod
    def create_booking(db, data, current_user: User):
        total_days = (
            data.to_date - data.from_date
        ).days
        product = ProductRepository.get_by_id(db, data.product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        shop_id = data.shop_id or product.shop_id
        if not BookingService._is_super_admin(current_user):
            if not current_user.shop_id:
                raise HTTPException(status_code=400, detail="Current user is not assigned to a shop")
            shop_id = current_user.shop_id

        if str(product.shop_id) != str(shop_id):
            raise HTTPException(status_code=400, detail="Product does not belong to this shop")

        booking = Booking(
            booking_number=f"BK{random.randint(100000,999999)}",
            user_id=data.user_id,
            shop_id=shop_id,
            product_id=data.product_id,
            from_date=data.from_date,
            to_date=data.to_date,
            total_days=total_days,
            rent_amount=500,
            security_deposit=2000,
            total_amount=(500 * total_days) + 2000
        )

        return BookingRepository.create(db, booking)

    @staticmethod
    def get_bookings(db, current_user: User):
        if BookingService._is_super_admin(current_user):
            return BookingRepository.get_all(db)

        return BookingRepository.get_by_shop(db, current_user.shop_id)

    @staticmethod
    def get_booking(db, booking_id, current_user: User):
        booking = BookingRepository.get_by_id(db, booking_id)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        BookingService._ensure_booking_access(current_user, booking)
        return booking

    @staticmethod
    def update_booking(db, booking_id, data, current_user: User):

        booking = BookingRepository.get_by_id(
            db,
            booking_id
        )

        if not booking:
            return None
        BookingService._ensure_booking_access(current_user, booking)

        booking.status = data.status

        return BookingRepository.update(db, booking)

    @staticmethod
    def delete_booking(db, booking_id, current_user: User):

        booking = BookingRepository.get_by_id(
            db,
            booking_id
        )

        if not booking:
            return False
        BookingService._ensure_booking_access(current_user, booking)

        BookingRepository.delete(db, booking)

        return True
