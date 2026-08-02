from app.models.category import Category
from app.repositories.category_repository import CategoryRepository


class CategoryService:

    @staticmethod
    def create_category(db, data):
        category = Category(name=data.name, description=data.description)
        return CategoryRepository.create(db, category)


    @staticmethod
    def get_categories(db):
        return CategoryRepository.get_all(db)

    @staticmethod
    def update_category(db, category_id, data):
        category = CategoryRepository.get_by_id(db, category_id)
        if not category:
            return None
        category.name = data.name
        category.description = data.description
        db.commit()
        db.refresh(category)
        return category

    @staticmethod
    def delete_category(db, category_id):
        category = CategoryRepository.get_by_id(db, category_id)

        if not category:
            return False

        CategoryRepository.delete(db, category)

        return True
