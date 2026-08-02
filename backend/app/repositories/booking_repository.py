from sqlalchemy.orm import Session

from app.models.booking import Booking


class BookingRepository:

    @staticmethod
    def create(db: Session, booking):
        db.add(booking)
        db.commit()
        db.refresh(booking)
        return booking

    @staticmethod
    def get_all(db: Session):
        return db.query(Booking).all()

    @staticmethod
    def get_by_shop(db: Session, shop_id):
        return db.query(Booking).filter(Booking.shop_id == shop_id).all()

    @staticmethod
    def get_by_id(db: Session, booking_id):
        return db.query(Booking).filter(
            Booking.id == booking_id
        ).first()

    @staticmethod
    def update(db: Session, booking):
        db.commit()
        db.refresh(booking)
        return booking

    @staticmethod
    def delete(db: Session, booking):
        db.delete(booking)
        db.commit()
