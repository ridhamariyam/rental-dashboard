"""update return_condition enum values

Revision ID: 84200913ec7a
Revises: 20a4049ecea4
Create Date: 2026-08-05 23:24:19.446434

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '84200913ec7a'
down_revision: Union[str, Sequence[str], None] = '20a4049ecea4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TYPE return_condition RENAME TO return_condition_old")
    sa.Enum('damaged', 'approved', 'clean', name='return_condition').create(op.get_bind())
    op.execute(
        "ALTER TABLE bookings ALTER COLUMN return_condition TYPE return_condition "
        "USING return_condition::text::return_condition"
    )
    op.execute("DROP TYPE return_condition_old")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("ALTER TYPE return_condition RENAME TO return_condition_old")
    sa.Enum('fine', 'damaged', name='return_condition').create(op.get_bind())
    op.execute(
        "ALTER TABLE bookings ALTER COLUMN return_condition TYPE return_condition "
        "USING (CASE WHEN return_condition::text = 'approved' THEN 'fine' "
        "WHEN return_condition::text = 'clean' THEN 'fine' "
        "ELSE return_condition::text END)::return_condition"
    )
    op.execute("DROP TYPE return_condition_old")
