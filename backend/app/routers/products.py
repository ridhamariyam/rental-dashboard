from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.product import ProductCreate, ProductUpdate
from app.services.product_service import ProductService
from app.utils.upload import save_upload

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


def _build_payload(form_data) -> dict[str, object]:
    payload: dict[str, object] = {}

    for key, value in form_data.multi_items():
        if key == "image":
            continue

        if key not in payload:
            payload[key] = value

    return payload


def _is_uploaded_file(value: object) -> bool:
    return hasattr(value, "filename") and hasattr(value, "read")


async def _parse_product_payload(request: Request) -> dict[str, object]:
    content_type = request.headers.get("content-type", "")

    if "multipart/form-data" not in content_type:
        return await request.json()

    form = await request.form()
    payload = _build_payload(form)

    image = form.get("image")
    if _is_uploaded_file(image) and getattr(image, "filename", None):
        payload["image"] = await save_upload(image, "products")
    elif isinstance(image, str) and image.strip():
        payload["image"] = str(image)

    return payload


@router.post("/")
async def create_product(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    payload = await _parse_product_payload(request)
    product = ProductCreate.model_validate(payload)
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
async def update_product(
    product_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    payload = await _parse_product_payload(request)
    product = ProductUpdate.model_validate(payload)
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
