from sqlalchemy.orm import Session, selectinload

from app.models.product import Product
from app.models.product_variation import ProductVariation


class ProductVariationRepository:
    @staticmethod
    def create(db: Session, variation: ProductVariation):
        db.add(variation)
        db.commit()
        db.refresh(variation)
        return variation

    @staticmethod
    def get_all(db: Session):
        return (
            db.query(ProductVariation)
            .options(selectinload(ProductVariation.product))
            .all()
        )

    @staticmethod
    def get_by_shop(db: Session, shop_id: str):
        return (
            db.query(ProductVariation)
            .join(Product, ProductVariation.product_id == Product.id)
            .options(selectinload(ProductVariation.product))
            .filter(Product.shop_id == shop_id)
            .all()
        )

    @staticmethod
    def get_by_id(db: Session, variation_id: str):
        return (
            db.query(ProductVariation)
            .options(selectinload(ProductVariation.product))
            .filter(ProductVariation.id == variation_id)
            .first()
        )

    @staticmethod
    def update(db: Session, variation: ProductVariation):
        db.commit()
        db.refresh(variation)
        return variation

    @staticmethod
    def delete(db: Session, variation: ProductVariation):
        db.delete(variation)
        db.commit()
