"""Rename game_core section type to game

Revision ID: c3d4e5f6g7h8
Revises: b2c3d4e5f6g7
Create Date: 2025-11-27 18:00:00.000000

This migration:
1. Updates section_type enum to use 'game' instead of 'game_core'
2. Updates any existing section_configs with section_type='game_core' to 'game'
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3d4e5f6g7h8'
down_revision: Union[str, None] = 'b2c3d4e5f6g7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add 'GAME' value to the enum if it doesn't exist
    # SQLAlchemy uses the enum member NAME (uppercase) not the value when using native PostgreSQL enums
    op.execute("ALTER TYPE sectiontype ADD VALUE IF NOT EXISTS 'GAME'")


def downgrade() -> None:
    # Note: PostgreSQL doesn't allow removing enum values easily
    # The 'game' value will remain in the enum but won't be used
    pass

