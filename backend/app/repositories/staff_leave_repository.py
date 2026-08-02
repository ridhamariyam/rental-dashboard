from sqlalchemy.orm import Session
from app.models.staff import StaffLeave
from app.models.user import User


class StaffLeaveRepository:

    @staticmethod
    def create(db: Session, leave):
        db.add(leave)
        db.commit()
        db.refresh(leave)
        return leave

    @staticmethod
    def get_all(db: Session):
        return db.query(StaffLeave).all()

    @staticmethod
    def get_by_shop(db: Session, shop_id):
        return (
            db.query(StaffLeave)
            .join(User, StaffLeave.staff_id == User.id)
            .filter(User.shop_id == shop_id)
            .all()
        )

    @staticmethod
    def get_by_id(db: Session, leave_id):
        return db.query(
            StaffLeave
        ).filter(
            StaffLeave.id == leave_id
        ).first()

    @staticmethod
    def update(db: Session, leave):
        db.commit()
        db.refresh(leave)
        return leave

    @staticmethod
    def delete(db: Session, leave):
        db.delete(leave)
        db.commit()
