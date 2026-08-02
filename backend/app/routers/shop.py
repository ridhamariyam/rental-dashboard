from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.shop import ShopCreate, ShopUpdate
from app.services.shop_service import ShopService

router = APIRouter(prefix="/shops",tags=["Shops"])
@router.post("/")
def create_shop(
    shop: ShopCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ShopService.create_shop(db, shop, current_user)


@router.get("/")
def get_shops(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ShopService.get_shops(db, current_user)


@router.get("/{shop_id}")
def get_shop(
    shop_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ShopService.get_shop(db, shop_id, current_user)


@router.put("/{shop_id}")
def update_shop(
    shop_id: str,
    shop: ShopUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = ShopService.update_shop(
        db,
        shop_id,
        shop,
        current_user
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Shop not found"
        )

    return result


@router.delete("/{shop_id}")
def delete_shop(
    shop_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = ShopService.delete_shop(
        db,
        shop_id,
        current_user
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Shop not found"
        )

    return {
        "message": "Shop deleted successfully"
    }
