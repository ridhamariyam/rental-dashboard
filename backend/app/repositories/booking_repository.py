from sqlalchemy.orm import Session, selectinload

from app.models.booking import Booking
from app.models.product import Product


def _booking_options():
    return (
        selectinload(Booking.user),
        selectinload(Booking.shop),
        selectinload(Booking.product).selectinload(Product.category),
        selectinload(Booking.variation),
    )


class BookingRepository:

    @staticmethod
    def create(db: Session, booking):
        db.add(booking)
        db.commit()
        db.refresh(booking)
        return booking

    @staticmethod
    def get_all(db: Session):
        return db.query(Booking).options(*_booking_options()).all()

    @staticmethod
    def get_by_shop(db: Session, shop_id):
        return db.query(Booking).options(*_booking_options()).filter(Booking.shop_id == shop_id).all()

    @staticmethod
    def get_by_user(db: Session, user_id):
        return (
            db.query(Booking)
            .options(*_booking_options())
            .filter(Booking.user_id == user_id)
            .order_by(Booking.created_at.desc())
            .all()
        )

    @staticmethod
    def get_by_id(db: Session, booking_id):
        return db.query(Booking).options(*_booking_options()).filter(Booking.id == booking_id).first()

    @staticmethod
    def update(db: Session, booking):
        db.commit()
        db.refresh(booking)
        return booking

    @staticmethod
    def delete(db: Session, booking):
        db.delete(booking)
        db.commit()
