"""create rental core tables

Revision ID: a8d2f4e3b6c1
Revises: 99ac0152a4c6
Create Date: 2026-08-01 12:37:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "a8d2f4e3b6c1"
down_revision: Union[str, Sequence[str], None] = "99ac0152a4c6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


booking_status = postgresql.ENUM(
    "pending",
    "confirmed",
    "picked",
    "returned",
    "cancelled",
    name="booking_status",
    create_type=False,
)

leave_status = postgresql.ENUM(
    "pending",
    "approved",
    "rejected",
    name="leave_status",
    create_type=False,
)


def timestamp_columns() -> list[sa.Column]:
    return [
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    ]


def upgrade() -> None:
    bind = op.get_bind()
    booking_status.create(bind, checkfirst=True)
    leave_status.create(bind, checkfirst=True)

    op.create_table(
        "categories",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    op.create_table(
        "shops",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=20), nullable=False),
        sa.Column("address", sa.Text(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("logo", sa.String(length=500), nullable=True),
        *timestamp_columns(),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("phone"),
    )

    op.create_table(
        "products",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("shop_id", sa.UUID(), nullable=False),
        sa.Column("category_id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("rent_price", sa.Float(), nullable=False),
        sa.Column("security_deposit", sa.Float(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("image", sa.String(length=500), nullable=True),
        sa.Column("sku", sa.String(length=100), nullable=False),
        sa.Column("barcode", sa.String(length=50), nullable=False),
        sa.Column("barcode_image", sa.String(length=500), nullable=True),
        sa.Column("is_available", sa.Boolean(), nullable=False),
        sa.Column("gallery", sa.JSON(), nullable=True),
        *timestamp_columns(),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"]),
        sa.ForeignKeyConstraint(["shop_id"], ["shops.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("barcode"),
        sa.UniqueConstraint("sku"),
    )

    op.create_table(
        "bookings",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("booking_number", sa.String(length=30), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("shop_id", sa.UUID(), nullable=False),
        sa.Column("product_id", sa.UUID(), nullable=False),
        sa.Column("from_date", sa.Date(), nullable=False),
        sa.Column("to_date", sa.Date(), nullable=False),
        sa.Column("total_days", sa.Integer(), nullable=False),
        sa.Column("rent_amount", sa.Float(), nullable=False),
        sa.Column("security_deposit", sa.Float(), nullable=False),
        sa.Column("total_amount", sa.Float(), nullable=False),
        sa.Column("status", booking_status, nullable=False),
        *timestamp_columns(),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.ForeignKeyConstraint(["shop_id"], ["shops.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("booking_number"),
    )

    op.create_table(
        "staff_leaves",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("staff_id", sa.UUID(), nullable=False),
        sa.Column("from_date", sa.Date(), nullable=False),
        sa.Column("to_date", sa.Date(), nullable=False),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("status", leave_status, nullable=False),
        *timestamp_columns(),
        sa.ForeignKeyConstraint(["staff_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("staff_leaves")
    op.drop_table("bookings")
    op.drop_table("products")
    op.drop_table("shops")
    op.drop_table("categories")
    leave_status.drop(op.get_bind(), checkfirst=True)
    booking_status.drop(op.get_bind(), checkfirst=True)
