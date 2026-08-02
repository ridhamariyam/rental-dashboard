# app/utils/validators.py
import re
def validate_password(password: str) -> str:
    """
    Validate user password.

    Requirements:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    """

    if len(password) < 8:
        raise ValueError(
            "Password must be at least 8 characters long"
        )

    if not re.search(r"[A-Z]", password):
        raise ValueError(
            "Password must contain at least one uppercase letter"
        )

    if not re.search(r"[a-z]", password):
        raise ValueError(
            "Password must contain at least one lowercase letter"
        )

    if not re.search(r"[0-9]", password):
        raise ValueError(
            "Password must contain at least one number"
        )

    return password


def validate_phone(phone: str) -> str:
    """
    Validate phone number.
    """

    phone = phone.strip()

    if not phone.isdigit():
        raise ValueError(
            "Phone number must contain only digits"
        )

    if len(phone) != 10:
        raise ValueError(
            "Phone number must contain 10 digits"
        )

    return phone


def validate_username(username: str) -> str:
    """
    Validate username.
    """

    username = username.strip()

    if len(username) < 3:
        raise ValueError(
            "Username must be at least 3 characters"
        )

    if len(username) > 50:
        raise ValueError(
            "Username cannot exceed 50 characters"
        )

    if not re.match(r"^[a-zA-Z0-9_]+$", username):
        raise ValueError(
            "Username can contain only letters, numbers and underscore"
        )

    return username