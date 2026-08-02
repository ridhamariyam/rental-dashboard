from sqlalchemy.orm import Session
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
        return db.query(Product).all()

    @staticmethod
    def get_by_shop(db: Session, shop_id: str):
        return db.query(Product).filter(Product.shop_id == shop_id).all()

    @staticmethod
    def get_by_id(db: Session, product_id: str):
        return db.query(Product).filter(
            Product.id == product_id
        ).first()

    @staticmethod
    def update(db: Session, product: Product):
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def delete(db: Session, product: Product):
        db.delete(product)
        db.commit()


    @staticmethod
    def get_by_barcode(db: Session, barcode: str):
        return (
            db.query(Product)
            .filter(Product.barcode == barcode)
            .first()
        )
