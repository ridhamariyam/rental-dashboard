import os
import sys
from pathlib import Path


sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.core.auth import hash_password
from app.core.enums import UserRole
from app.database import SessionLocal
from app.models.shop import Shop  # noqa: F401
from app.models.user import User
from app.repositories.user_repository import UserRepository


def main() -> None:
    email = os.getenv("SUPER_ADMIN_EMAIL", "superadmin@example.com")
    password = os.getenv("SUPER_ADMIN_PASSWORD", "Admin@12345")
    first_name = os.getenv("SUPER_ADMIN_FIRST_NAME", "Super")
    last_name = os.getenv("SUPER_ADMIN_LAST_NAME", "Admin")
    username = os.getenv("SUPER_ADMIN_USERNAME", "superadmin")
    phone = os.getenv("SUPER_ADMIN_PHONE", "9999999999")

    db = SessionLocal()
    try:
        user = UserRepository.get_by_email(db, email)

        if user:
            user.role = UserRole.SUPER_ADMIN
            user.shop_id = None
            user.password = hash_password(password)
            UserRepository.update(db, user)
            print(f"Updated super admin: {email}")
            return

        user = User(
            first_name=first_name,
            last_name=last_name,
            username=username,
            email=email,
            phone=phone,
            password=hash_password(password),
            role=UserRole.SUPER_ADMIN,
            shop_id=None,
        )
        UserRepository.create(db, user)
        print(f"Created super admin: {email}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
