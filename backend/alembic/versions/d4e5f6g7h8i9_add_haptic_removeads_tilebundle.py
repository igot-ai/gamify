"""Add haptic, remove_ads, tile_bundle section types

Revision ID: d4e5f6g7h8i9
Revises: c3d4e5f6g7h8
Create Date: 2025-11-27 20:00:00.000000

This migration adds new section types for:
- HAPTIC: Haptic feedback configuration
- REMOVE_ADS: Remove ads offer configuration
- TILE_BUNDLE: Tile bundle offer configuration
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd4e5f6g7h8i9'
down_revision: Union[str, None] = 'c3d4e5f6g7h8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new section type values to the enum
    # SQLAlchemy uses enum member NAMES (uppercase) when using native PostgreSQL enums
    op.execute("ALTER TYPE sectiontype ADD VALUE IF NOT EXISTS 'HAPTIC'")
    op.execute("ALTER TYPE sectiontype ADD VALUE IF NOT EXISTS 'REMOVE_ADS'")
    op.execute("ALTER TYPE sectiontype ADD VALUE IF NOT EXISTS 'TILE_BUNDLE'")


def downgrade() -> None:
    # Note: PostgreSQL doesn't allow removing enum values easily
    # The values will remain in the enum but won't be used
    pass







