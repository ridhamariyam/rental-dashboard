"""change role to enum

Revision ID: 1d4a487c6b9d
Revises: 52b5e5a75382
Create Date: 2026-07-28 11:35:00.476984
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "1d4a487c6b9d"
down_revision: Union[str, Sequence[str], None] = "52b5e5a75382"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


user_role = sa.Enum(
    "customer",
    "staff",
    "admin",
    name="user_role"
)


def upgrade() -> None:
    # Create PostgreSQL enum type
    user_role.create(op.get_bind(), checkfirst=True)

    # Change column type
    op.alter_column(
        "users",
        "role",
        existing_type=sa.VARCHAR(length=20),
        type_=user_role,
        existing_nullable=False,
        postgresql_using="role::user_role",
    )


def downgrade() -> None:
    # Convert enum back to varchar
    op.alter_column(
        "users",
        "role",
        existing_type=user_role,
        type_=sa.VARCHAR(length=20),
        existing_nullable=False,
        postgresql_using="role::text",
    )

    # Drop enum type
    user_role.drop(op.get_bind(), checkfirst=True)