import random

from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder

from app.core.enums import BookingStatus, ReturnCondition, UserRole
from app.models.booking import Booking
from app.models.user import User
from app.repositories.booking_repository import BookingRepository
from app.repositories.product_repository import ProductRepository
from app.repositories.product_variation_repository import ProductVariationRepository
from app.repositories.user_repository import UserRepository
from app.services.product_service import ProductService

class BookingService:
    @staticmethod
    def _is_super_admin(user: User) -> bool:
        role = user.role.value if hasattr(user.role, "value") else user.role
        return role == UserRole.SUPER_ADMIN.value

    @staticmethod
    def _serialize_booking(booking: Booking):
        data = jsonable_encoder(booking)
        if data.get("user"):
            data["user"].pop("password", None)
        if data.get("collected_by"):
            data["collected_by"].pop("password", None)
        if data.get("created_by"):
            data["created_by"].pop("password", None)
        return data

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
            total_amount=(500 * total_days) + 2000,
            created_by_id=current_user.id,
        )

        created_booking = BookingRepository.create(db, booking)
        return BookingService._serialize_booking(BookingRepository.get_by_id(db, created_booking.id))

    @staticmethod
    def assign_variation(db, variation_id, data, current_user: User):
        variation = ProductVariationRepository.get_by_id(db, variation_id)

        if not variation:
            raise HTTPException(status_code=404, detail="Variation not found")

        ProductService._ensure_product_access(current_user, variation.product)

        if not variation.is_available or variation.quantity <= 0:
            raise HTTPException(status_code=400, detail="Variation is not available")

        total_days = (data.to_date - data.from_date).days
        if total_days <= 0:
            raise HTTPException(status_code=400, detail="To date must be after from date")

        security_deposit = data.security_deposit if data.security_deposit is not None else variation.security_deposit

        try:
            status = BookingStatus(data.status) if data.status else BookingStatus.CONFIRMED
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid status")

        booking = Booking(
            booking_number=f"BK{random.randint(100000,999999)}",
            user_id=data.user_id,
            shop_id=variation.product.shop_id,
            product_id=variation.product_id,
            variation_id=variation.id,
            from_date=data.from_date,
            to_date=data.to_date,
            total_days=total_days,
            rent_amount=variation.rent_price,
            security_deposit=security_deposit,
            total_amount=variation.rent_price * total_days,
            status=status,
            created_by_id=current_user.id,
        )

        variation.quantity -= 1
        if variation.quantity <= 0:
            variation.is_available = False

        created_booking = BookingRepository.create(db, booking)
        ProductVariationRepository.update(db, variation)

        return BookingService._serialize_booking(BookingRepository.get_by_id(db, created_booking.id))

    @staticmethod
    def get_bookings(db, current_user: User):
        bookings = (
            BookingRepository.get_all(db)
            if BookingService._is_super_admin(current_user)
            else BookingRepository.get_by_shop(db, current_user.shop_id)
        )

        return [BookingService._serialize_booking(booking) for booking in bookings]

    @staticmethod
    def get_bookings_for_user(db, user_id, current_user: User):
        target_user = UserRepository.get_by_id(db, user_id)
        if not target_user:
            raise HTTPException(status_code=404, detail="User not found")

        if not BookingService._is_super_admin(current_user) and str(current_user.id) != str(user_id):
            if not current_user.shop_id or str(target_user.shop_id) != str(current_user.shop_id):
                raise HTTPException(status_code=404, detail="User not found")

        bookings = BookingRepository.get_by_user(db, user_id)
        return [BookingService._serialize_booking(booking) for booking in bookings]

    @staticmethod
    def get_booking(db, booking_id, current_user: User):
        booking = BookingRepository.get_by_id(db, booking_id)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        BookingService._ensure_booking_access(current_user, booking)
        return BookingService._serialize_booking(booking)

    @staticmethod
    def update_booking(db, booking_id, data, current_user: User):

        booking = BookingRepository.get_by_id(
            db,
            booking_id
        )

        if not booking:
            return None
        BookingService._ensure_booking_access(current_user, booking)

        if data.product_id is not None and str(data.product_id) != str(booking.product_id):
            product = ProductRepository.get_by_id(db, data.product_id)
            if not product:
                raise HTTPException(status_code=404, detail="Product not found")
            if str(product.shop_id) != str(booking.shop_id):
                raise HTTPException(status_code=400, detail="Product does not belong to this shop")

            booking.product_id = data.product_id
            booking.variation_id = None

        variation_changed = data.variation_id is not None and str(data.variation_id) != str(
            booking.variation_id or ""
        )

        if variation_changed:
            new_variation = ProductVariationRepository.get_by_id(db, data.variation_id)
            if not new_variation:
                raise HTTPException(status_code=404, detail="Variation not found")
            if str(new_variation.product.shop_id) != str(booking.shop_id):
                raise HTTPException(status_code=400, detail="Variation does not belong to this shop")
            if not new_variation.is_available or new_variation.quantity <= 0:
                raise HTTPException(status_code=400, detail="Variation is not available")

            if booking.variation_id:
                old_variation = ProductVariationRepository.get_by_id(db, booking.variation_id)
                if old_variation:
                    old_variation.quantity += 1
                    old_variation.is_available = True
                    ProductVariationRepository.update(db, old_variation)

            new_variation.quantity -= 1
            if new_variation.quantity <= 0:
                new_variation.is_available = False
            ProductVariationRepository.update(db, new_variation)

            booking.variation_id = new_variation.id
            booking.product_id = new_variation.product_id
            booking.rent_amount = new_variation.rent_price

        if data.from_date is not None:
            booking.from_date = data.from_date

        if data.to_date is not None:
            booking.to_date = data.to_date

        if data.security_deposit is not None:
            booking.security_deposit = data.security_deposit

        if data.from_date is not None or data.to_date is not None or variation_changed:
            total_days = (booking.to_date - booking.from_date).days
            if total_days <= 0:
                raise HTTPException(status_code=400, detail="To date must be after from date")

            booking.total_days = total_days
            booking.total_amount = booking.rent_amount * total_days

        if data.status is not None:
            booking.status = data.status

        BookingRepository.update(db, booking)
        return BookingService._serialize_booking(BookingRepository.get_by_id(db, booking_id))

    @staticmethod
    def return_booking(db, booking_id, data, current_user: User):
        booking = BookingRepository.get_by_id(db, booking_id)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        BookingService._ensure_booking_access(current_user, booking)

        if booking.status == BookingStatus.RETURNED:
            raise HTTPException(status_code=400, detail="Booking has already been returned")
        if booking.status not in (BookingStatus.CONFIRMED, BookingStatus.PICKED):
            raise HTTPException(status_code=400, detail="Booking must be picked up before it can be returned")

        try:
            return_condition = ReturnCondition(data.return_condition)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid return condition")

        current_role = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
        if current_role not in (UserRole.STAFF.value, UserRole.ADMIN.value, UserRole.SUPER_ADMIN.value):
            raise HTTPException(status_code=403, detail="Only staff or admin can record a product return")

        booking.return_condition = return_condition
        booking.damage_notes = data.damage_notes
        booking.return_image = data.return_image
        booking.collected_by_id = current_user.id
        booking.status = BookingStatus.RETURNED

        BookingRepository.update(db, booking)
        return BookingService._serialize_booking(BookingRepository.get_by_id(db, booking_id))

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
