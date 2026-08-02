import random
import string


def generate_sku():
    random_part = ''.join(
        random.choices(
            string.ascii_uppercase + string.digits,
            k=8
        )
    )

    return f"SKU-{random_part}"


def generate_barcode():
    return ''.join(
        random.choices(
            "0123456789",
            k=13
        )
    )