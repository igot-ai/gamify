"""Replace firebase_project_id with firebase_service_account JSON

Revision ID: h8i9j0k1l2m3
Revises: g7h8i9j0k1l2
Create Date: 2024-12-02 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'h8i9j0k1l2m3'
down_revision: Union[str, None] = 'g7h8i9j0k1l2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new firebase_service_account column (JSON type)
    op.add_column('games', sa.Column('firebase_service_account', postgresql.JSON(astext_type=sa.Text()), nullable=True))
    
    # Drop the old firebase_project_id column
    op.drop_column('games', 'firebase_project_id')


def downgrade() -> None:
    # Add back the old firebase_project_id column
    op.add_column('games', sa.Column('firebase_project_id', sa.String(), nullable=True))
    
    # Drop the firebase_service_account column
    op.drop_column('games', 'firebase_service_account')

