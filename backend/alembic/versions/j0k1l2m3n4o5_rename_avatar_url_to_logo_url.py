"""Rename avatar_url to logo_url in games table

Revision ID: j0k1l2m3n4o5
Revises: 06e604ffc276
Create Date: 2025-12-02 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'j0k1l2m3n4o5'
down_revision: Union[str, None] = 'i9j0k1l2m3n4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Rename avatar_url column to logo_url
    op.alter_column('games', 'avatar_url', new_column_name='logo_url')


def downgrade() -> None:
    # Rename logo_url column back to avatar_url
    op.alter_column('games', 'logo_url', new_column_name='avatar_url')

