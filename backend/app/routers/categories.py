from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.schemas.category import ( CategoryCreate,CategoryUpdate)
from app.services.category_service import CategoryService

categoryrouter = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)


@categoryrouter.post("/")
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    return CategoryService.create_category(db, category)


@categoryrouter.get("/")
def get_categories(db: Session = Depends(get_db)):
    return CategoryService.get_categories(db)


@categoryrouter.put("/{category_id}")
def update_category(category_id: str,category: CategoryUpdate,db: Session = Depends(get_db)):
    result = CategoryService.update_category(db,category_id,category)
    if not result:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )
    return result


@categoryrouter.delete("/{category_id}")
def delete_category(
    category_id: str,
    db: Session = Depends(get_db)):
    result = CategoryService.delete_category(db,category_id)
    if not result:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    return {
        "message": "Category deleted successfully"
    }