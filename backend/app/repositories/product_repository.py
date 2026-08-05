from sqlalchemy.orm import Session
from sqlalchemy.orm import selectinload
from app.models.product import Product

class ProductRepository:
    @staticmethod
    def create(db: Session, product: Product):
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def get_all(db: Session):
        return (
            db.query(Product)
            .options(
                selectinload(Product.shop),
                selectinload(Product.category),
            )
            .all()
        )

    @staticmethod
    def get_by_shop(db: Session, shop_id: str):
        return (
            db.query(Product)
            .options(
                selectinload(Product.shop),
                selectinload(Product.category),
            )
            .filter(Product.shop_id == shop_id)
            .all()
        )

    @staticmethod
    def get_by_id(db: Session, product_id: str):
        return (
            db.query(Product)
            .options(
                selectinload(Product.shop),
                selectinload(Product.category),
            )
            .filter(Product.id == product_id)
            .first()
        )

    @staticmethod
    def update(db: Session, product: Product):
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def delete(db: Session, product: Product):
        db.delete(product)
        db.commit()
