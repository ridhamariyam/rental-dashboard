"""add shop scope to users

Revision ID: 6c3f0a9b2d1e
Revises: a8d2f4e3b6c1
Create Date: 2026-08-01 13:15:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "6c3f0a9b2d1e"
down_revision: Union[str, Sequence[str], None] = "a8d2f4e3b6c1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin'")
    op.add_column("users", sa.Column("shop_id", sa.UUID(), nullable=True))
    op.create_foreign_key(
        "fk_users_shop_id_shops",
        "users",
        "shops",
        ["shop_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint("fk_users_shop_id_shops", "users", type_="foreignkey")
    op.drop_column("users", "shop_id")
