from fastapi import HTTPException

from app.models.product_variation import ProductVariation
from app.models.user import User
from app.repositories.product_repository import ProductRepository
from app.repositories.product_variation_repository import ProductVariationRepository
from app.services.product_service import ProductService
from app.utils.barcode import generate_barcode_image
from app.utils.helpers import generate_barcode, generate_sku


class ProductVariationService:
    @staticmethod
    def _get_accessible_product(db, product_id, current_user: User):
        product = ProductRepository.get_by_id(db, product_id)

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        ProductService._ensure_product_access(current_user, product)
        return product

    @staticmethod
    def _get_accessible_variation(db, variation_id, current_user: User) -> ProductVariation:
        variation = ProductVariationRepository.get_by_id(db, variation_id)

        if not variation:
            raise HTTPException(status_code=404, detail="Variation not found")

        ProductService._ensure_product_access(current_user, variation.product)
        return variation

    @staticmethod
    def create_variation(db, data, current_user: User):
        ProductVariationService._get_accessible_product(db, data.product_id, current_user)

        barcode = generate_barcode()

        variation = ProductVariation(
            product_id=data.product_id,
            color=data.color,
            size=data.size,
            sku=generate_sku(),
            barcode=barcode,
            barcode_image=generate_barcode_image(barcode),
            gallery=data.gallery,
            rent_price=data.rent_price,
            security_deposit=data.security_deposit,
            quantity=data.quantity,
            is_available=data.is_available,
        )

        return ProductVariationRepository.create(db, variation)

    @staticmethod
    def get_variations(db, current_user: User):
        if ProductService._is_super_admin(current_user):
            return ProductVariationRepository.get_all(db)

        return ProductVariationRepository.get_by_shop(db, current_user.shop_id)

    @staticmethod
    def get_variation(db, variation_id, current_user: User):
        return ProductVariationService._get_accessible_variation(db, variation_id, current_user)

    @staticmethod
    def update_variation(db, variation_id, data, current_user: User):
        variation = ProductVariationService._get_accessible_variation(db, variation_id, current_user)
        ProductVariationService._get_accessible_product(db, data.product_id, current_user)

        variation.product_id = data.product_id
        variation.color = data.color
        variation.size = data.size
        variation.gallery = data.gallery
        variation.rent_price = data.rent_price
        variation.security_deposit = data.security_deposit
        variation.quantity = data.quantity
        variation.is_available = data.is_available

        return ProductVariationRepository.update(db, variation)

    @staticmethod
    def delete_variation(db, variation_id, current_user: User):
        variation = ProductVariationService._get_accessible_variation(db, variation_id, current_user)
        ProductVariationRepository.delete(db, variation)
        return True
