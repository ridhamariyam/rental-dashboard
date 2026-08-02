from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    @staticmethod
    def create(db: Session, user: User):
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def get_by_email(db: Session, email: str):

        return db.query(User).filter(
            User.email == email
        ).first()
    
    @staticmethod
    def get_by_phone(db, phone):
        return (
            db.query(User)
            .filter(User.phone == phone)
            .first()
        )

    @staticmethod
    def get_all(db: Session):
        return db.query(User).order_by(User.created_at.desc()).all()

    @staticmethod
    def get_by_shop(db: Session, shop_id: str):
        return (
            db.query(User)
            .filter(User.shop_id == shop_id)
            .order_by(User.created_at.desc())
            .all()
        )

    @staticmethod
    def get_by_id(db: Session, user_id: str):
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def update(db: Session, user: User):
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def delete(db: Session, user: User):
        db.delete(user)
        db.commit()
