from sqlalchemy.orm import Session
from app.models.shop import Shop

class ShopRepository:

    @staticmethod
    def create(db: Session, shop: Shop):
        db.add(shop)
        db.commit()
        db.refresh(shop)
        return shop

    @staticmethod
    def get_all(db: Session):
        return db.query(Shop).all()

    @staticmethod
    def get_by_id(db: Session, shop_id: str):
        return (
            db.query(Shop)
            .filter(Shop.id == shop_id)
            .first()
        )

    @staticmethod
    def update(db: Session, shop: Shop):
        db.commit()
        db.refresh(shop)
        return shop

    @staticmethod
    def delete(db: Session, shop: Shop):
        db.delete(shop)
        db.commit()