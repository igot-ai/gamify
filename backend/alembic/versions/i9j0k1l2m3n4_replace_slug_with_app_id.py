"""Replace slug with app_id

Revision ID: i9j0k1l2m3n4
Revises: h8i9j0k1l2m3
Create Date: 2024-12-02 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'i9j0k1l2m3n4'
down_revision: Union[str, None] = 'h8i9j0k1l2m3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new app_id column
    op.add_column('games', sa.Column('app_id', sa.String(), nullable=True))
    
    # Copy slug values to app_id (for existing data)
    op.execute("UPDATE games SET app_id = slug WHERE app_id IS NULL")
    
    # Make app_id not nullable after data migration
    op.alter_column('games', 'app_id', nullable=False)
    
    # Create unique index on app_id
    op.create_index(op.f('ix_games_app_id'), 'games', ['app_id'], unique=True)
    
    # Drop the old slug column and its index
    op.drop_index('ix_games_slug', table_name='games')
    op.drop_column('games', 'slug')


def downgrade() -> None:
    # Add back the slug column
    op.add_column('games', sa.Column('slug', sa.String(), nullable=True))
    
    # Copy app_id values back to slug
    op.execute("UPDATE games SET slug = app_id WHERE slug IS NULL")
    
    # Make slug not nullable
    op.alter_column('games', 'slug', nullable=False)
    
    # Create unique index on slug
    op.create_index('ix_games_slug', 'games', ['slug'], unique=True)
    
    # Drop app_id column and its index
    op.drop_index(op.f('ix_games_app_id'), table_name='games')
    op.drop_column('games', 'app_id')

