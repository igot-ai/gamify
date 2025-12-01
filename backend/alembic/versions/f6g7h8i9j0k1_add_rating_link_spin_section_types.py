"""Add rating, link, game_economy, shop_settings, spin, hint_offer section types

Revision ID: f6g7h8i9j0k1
Revises: e5f6g7h8i9j0
Create Date: 2025-12-01 10:00:00.000000

This migration adds new section types for:
- RATING: In-app rating prompt configuration
- LINK: Privacy and terms links
- GAME_ECONOMY: Game economy settings (revive costs, rewards)
- SHOP_SETTINGS: Shop enable and restore settings
- SPIN: Spin wheel configuration
- HINT_OFFER: Hint offer popup settings
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f6g7h8i9j0k1'
down_revision: Union[str, None] = 'e5f6g7h8i9j0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new section type values to the enum
    # SQLAlchemy uses enum member NAMES (uppercase) when using native PostgreSQL enums
    op.execute("ALTER TYPE sectiontype ADD VALUE IF NOT EXISTS 'RATING'")
    op.execute("ALTER TYPE sectiontype ADD VALUE IF NOT EXISTS 'LINK'")
    op.execute("ALTER TYPE sectiontype ADD VALUE IF NOT EXISTS 'GAME_ECONOMY'")
    op.execute("ALTER TYPE sectiontype ADD VALUE IF NOT EXISTS 'SHOP_SETTINGS'")
    op.execute("ALTER TYPE sectiontype ADD VALUE IF NOT EXISTS 'SPIN'")
    op.execute("ALTER TYPE sectiontype ADD VALUE IF NOT EXISTS 'HINT_OFFER'")


def downgrade() -> None:
    # Note: PostgreSQL doesn't allow removing enum values easily
    # The values will remain in the enum but won't be used
    pass

