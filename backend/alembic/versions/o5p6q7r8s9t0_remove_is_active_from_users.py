"""Remove is_active column from users table

Revision ID: o5p6q7r8s9t0
Revises: n4o5p6q7r8s9
Create Date: 2025-01-XX

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'o5p6q7r8s9t0'
down_revision: Union[str, None] = 'n4o5p6q7r8s9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop is_active column from users table
    op.drop_column('users', 'is_active')


def downgrade() -> None:
    # Add is_active column back to users table
    op.add_column('users', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))

