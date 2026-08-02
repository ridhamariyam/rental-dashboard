from fastapi import HTTPException

from app.core.enums import UserRole
from app.models.product import Product
from app.models.user import User
from app.repositories.product_repository import ProductRepository
from app.utils.helpers import generate_sku, generate_barcode


class ProductService:
    @staticmethod
    def _is_super_admin(user: User) -> bool:
        role = user.role.value if hasattr(user.role, "value") else user.role
        return role == UserRole.SUPER_ADMIN.value

    @staticmethod
    def _resolve_shop_id(current_user: User, requested_shop_id):
        if ProductService._is_super_admin(current_user):
            if not requested_shop_id:
                raise HTTPException(status_code=400, detail="shop_id is required")
            return requested_shop_id

        if not current_user.shop_id:
            raise HTTPException(status_code=400, detail="Current user is not assigned to a shop")

        if requested_shop_id and str(requested_shop_id) != str(current_user.shop_id):
            raise HTTPException(status_code=403, detail="You cannot access another shop")

        return current_user.shop_id

    @staticmethod
    def _ensure_product_access(current_user: User, product: Product):
        if ProductService._is_super_admin(current_user):
            return

        if not current_user.shop_id or str(product.shop_id) != str(current_user.shop_id):
            raise HTTPException(status_code=404, detail="Product not found")

    @staticmethod
    def create_product(db, data, current_user: User):
        shop_id = ProductService._resolve_shop_id(current_user, data.shop_id)
        product = Product(
            shop_id=shop_id,
            category_id=data.category_id,
            name=data.name,
            description=data.description,
            sku=generate_sku(),
            barcode=generate_barcode(),
            image=data.image,
            gallery=data.gallery,
            rent_price=data.rent_price,
            security_deposit=data.security_deposit,
            quantity=data.quantity,
        )

        return ProductRepository.create(db, product)

    @staticmethod
    def get_products(db, current_user: User):
        if ProductService._is_super_admin(current_user):
            return ProductRepository.get_all(db)

        return ProductRepository.get_by_shop(db, current_user.shop_id)

    @staticmethod
    def get_product(db, product_id, current_user: User):

        product = ProductRepository.get_by_id(db, product_id)

        if not product:
            raise HTTPException(404, "Product not found")

        ProductService._ensure_product_access(current_user, product)
        return product

    @staticmethod
    def update_product(db, product_id, data, current_user: User):

        product = ProductRepository.get_by_id(db, product_id)

        if not product:
            return None
        ProductService._ensure_product_access(current_user, product)

        product.shop_id = ProductService._resolve_shop_id(current_user, data.shop_id)
        product.category_id = data.category_id
        product.name = data.name
        product.description = data.description
        product.image = data.image
        product.gallery = data.gallery
        product.rent_price = data.rent_price
        product.security_deposit = data.security_deposit
        product.quantity = data.quantity
        return ProductRepository.update(db, product)

    @staticmethod
    def delete_product(db, product_id, current_user: User):

        product = ProductRepository.get_by_id(db, product_id)

        if not product:
            return False
        ProductService._ensure_product_access(current_user, product)

        ProductRepository.delete(db, product)

        return True
    
    @staticmethod
    def get_product_by_barcode(db, barcode, current_user: User):
        product = ProductRepository.get_by_barcode(
            db,
            barcode
        )

        if not product:
            raise HTTPException(
                status_code=404,
                detail="Product not found"
            )

        ProductService._ensure_product_access(current_user, product)
        return product
