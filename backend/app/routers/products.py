from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.product import ProductCreate, ProductUpdate
from app.services.product_service import ProductService

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


@router.post("/")
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ProductService.create_product(db, product, current_user)


@router.get("/")
def get_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ProductService.get_products(db, current_user)


@router.get("/{product_id}")
def get_product(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ProductService.get_product(db, product_id, current_user)


@router.put("/{product_id}")
def update_product(
    product_id: str,
    product: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = ProductService.update_product(
        db,
        product_id,
        product,
        current_user
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return result


@router.delete("/{product_id}")
def delete_product(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = ProductService.delete_product(
        db,
        product_id,
        current_user
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return {
        "message": "Product deleted successfully"
    }

@router.get("/barcode/{barcode}")
def get_product_by_barcode(
    barcode: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ProductService.get_product_by_barcode(
        db,
        barcode,
        current_user
    )
