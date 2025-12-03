"""Remove Firebase and add version fields

Revision ID: k1l2m3n4o5p6
Revises: j0k1l2m3n4o5
Create Date: 2025-01-02 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'k1l2m3n4o5p6'
down_revision: Union[str, None] = 'j0k1l2m3n4o5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop firebase_service_account from games table
    op.drop_column('games', 'firebase_service_account')
    
    # Drop firebase_uid from users table (use IF EXISTS for safety)
    op.execute('DROP INDEX IF EXISTS ix_users_firebase_uid')
    op.drop_column('users', 'firebase_uid')
    
    # Drop draft/publish columns from section_configs table
    op.drop_column('section_configs', 'draft_data')
    op.drop_column('section_configs', 'draft_updated_at')
    op.drop_column('section_configs', 'draft_updated_by')
    op.drop_column('section_configs', 'published_data')
    op.drop_column('section_configs', 'published_version')
    op.drop_column('section_configs', 'published_at')
    op.drop_column('section_configs', 'published_by')
    op.drop_column('section_configs', 'has_unpublished_changes')
    
    # Drop old unique constraint and indexes that reference 'version' (use IF EXISTS)
    op.execute('ALTER TABLE section_config_versions DROP CONSTRAINT IF EXISTS uq_section_config_version')
    op.execute('DROP INDEX IF EXISTS idx_section_config_version_version')
    
    # Drop old columns from section_config_versions
    op.drop_column('section_config_versions', 'version')
    op.drop_column('section_config_versions', 'published_at')
    op.drop_column('section_config_versions', 'published_by')
    
    # Add new columns to section_config_versions
    op.add_column('section_config_versions', sa.Column('title', sa.String(), nullable=True))
    op.add_column('section_config_versions', sa.Column('experiment', sa.String(), nullable=True))
    op.add_column('section_config_versions', sa.Column('variant', sa.String(), nullable=True))


def downgrade() -> None:
    # Re-add firebase_service_account to games table
    op.add_column('games', sa.Column('firebase_service_account', postgresql.JSON(astext_type=sa.Text()), nullable=True))
    
    # Re-add firebase_uid to users table
    op.add_column('users', sa.Column('firebase_uid', sa.String(), nullable=True))
    op.create_index('ix_users_firebase_uid', 'users', ['firebase_uid'], unique=True)
    
    # Re-add draft/publish columns to section_configs
    op.add_column('section_configs', sa.Column('draft_data', postgresql.JSON(astext_type=sa.Text()), nullable=True))
    op.add_column('section_configs', sa.Column('draft_updated_at', sa.DateTime(), nullable=True))
    op.add_column('section_configs', sa.Column('draft_updated_by', sa.String(), nullable=True))
    op.add_column('section_configs', sa.Column('published_data', postgresql.JSON(astext_type=sa.Text()), nullable=True))
    op.add_column('section_configs', sa.Column('published_version', sa.Integer(), nullable=True))
    op.add_column('section_configs', sa.Column('published_at', sa.DateTime(), nullable=True))
    op.add_column('section_configs', sa.Column('published_by', sa.String(), nullable=True))
    op.add_column('section_configs', sa.Column('has_unpublished_changes', sa.Boolean(), nullable=False, server_default='false'))
    
    # Drop new columns from section_config_versions
    op.drop_column('section_config_versions', 'title')
    op.drop_column('section_config_versions', 'experiment')
    op.drop_column('section_config_versions', 'variant')
    
    # Re-add old columns to section_config_versions
    op.add_column('section_config_versions', sa.Column('version', sa.Integer(), nullable=False))
    op.add_column('section_config_versions', sa.Column('published_at', sa.DateTime(), nullable=False))
    op.add_column('section_config_versions', sa.Column('published_by', sa.String(), nullable=False))
    
    # Re-add old constraint and indexes
    op.create_unique_constraint('uq_section_config_version', 'section_config_versions', ['section_config_id', 'version'])
    op.create_index('idx_section_config_version_version', 'section_config_versions', ['section_config_id', 'version'])
