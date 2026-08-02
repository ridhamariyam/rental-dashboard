from fastapi import HTTPException

from app.core.enums import UserRole
from app.models.shop import Shop
from app.models.user import User
from app.repositories.shop_repository import ShopRepository


class ShopService:
    @staticmethod
    def _is_super_admin(user: User) -> bool:
        role = user.role.value if hasattr(user.role, "value") else user.role
        return role == UserRole.SUPER_ADMIN.value

    @staticmethod
    def _ensure_super_admin(user: User):
        if not ShopService._is_super_admin(user):
            raise HTTPException(status_code=403, detail="Only super admin can manage shops")

    @staticmethod
    def _ensure_shop_access(current_user: User, shop_id: str):
        if ShopService._is_super_admin(current_user):
            return

        if not current_user.shop_id or str(current_user.shop_id) != str(shop_id):
            raise HTTPException(status_code=404, detail="Shop not found")

    @staticmethod
    def create_shop(db, data, current_user: User):
        ShopService._ensure_super_admin(current_user)
        shop = Shop(
            name=data.name,
            email=data.email,
            phone=data.phone,
            address=data.address,
            description=data.description,
            logo=data.logo
        )

        return ShopRepository.create(db, shop)
    @staticmethod
    def get_shops(db, current_user: User):
        if ShopService._is_super_admin(current_user):
            return ShopRepository.get_all(db)

        if not current_user.shop_id:
            return []

        shop = ShopRepository.get_by_id(db, str(current_user.shop_id))
        return [shop] if shop else []
    

    @staticmethod
    def get_shop(db, shop_id, current_user: User):
        ShopService._ensure_shop_access(current_user, shop_id)
        shop = ShopRepository.get_by_id(db, shop_id)
        if not shop:
            raise HTTPException(
                status_code=404,
                detail="Shop not found"
            )
        return shop


    @staticmethod
    def update_shop(db, shop_id, data, current_user: User):
        ShopService._ensure_super_admin(current_user)
        shop = ShopRepository.get_by_id(db, shop_id)
        if not shop:
            return None
        shop.name = data.name
        shop.email = data.email
        shop.phone = data.phone
        shop.address = data.address
        shop.description = data.description
        shop.logo = data.logo
        return ShopRepository.update(db, shop)


    @staticmethod
    def delete_shop(db, shop_id, current_user: User):
        ShopService._ensure_super_admin(current_user)
        shop = ShopRepository.get_by_id(db, shop_id)
        if not shop:
            return False
        ShopRepository.delete(db, shop)
        return True
