"""Add tutorial section type

Revision ID: g7h8i9j0k1l2
Revises: f6g7h8i9j0k1
Create Date: 2025-12-01 12:00:00.000000

This migration adds the TUTORIAL section type for tutorial configuration.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'g7h8i9j0k1l2'
down_revision: Union[str, None] = 'f6g7h8i9j0k1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new section type value to the enum
    op.execute("ALTER TYPE sectiontype ADD VALUE IF NOT EXISTS 'TUTORIAL'")


def downgrade() -> None:
    # Note: PostgreSQL doesn't allow removing enum values easily
    # The value will remain in the enum but won't be used
    pass

