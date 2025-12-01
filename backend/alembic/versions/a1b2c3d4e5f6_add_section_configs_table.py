"""Add section_configs table

Revision ID: a1b2c3d4e5f6
Revises: 06e604ffc276
Create Date: 2025-11-27 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '06e604ffc276'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create section_configs table
    op.create_table('section_configs',
        sa.Column('game_id', sa.String(), nullable=False),
        sa.Column('section_type', sa.Enum('ECONOMY', 'ADS', 'NOTIFICATION', 'SHOP', 'BOOSTER', 'CHAPTER_REWARD', 'GAME_CORE', 'ANALYTICS', 'UX', name='sectiontype'), nullable=False),
        sa.Column('version', sa.Integer(), nullable=False),
        sa.Column('config_data', sa.JSON(), nullable=True),
        sa.Column('status', sa.Enum('DRAFT', 'IN_REVIEW', 'APPROVED', 'DEPLOYED', 'ARCHIVED', name='sectionconfigstatus'), nullable=False),
        sa.Column('created_by', sa.String(), nullable=False),
        sa.Column('updated_by', sa.String(), nullable=True),
        sa.Column('reviewed_by', sa.String(), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(), nullable=True),
        sa.Column('approved_by', sa.String(), nullable=True),
        sa.Column('approved_at', sa.DateTime(), nullable=True),
        sa.Column('deployed_at', sa.DateTime(), nullable=True),
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['game_id'], ['games.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('game_id', 'section_type', 'version', name='uq_section_config_game_type_version')
    )
    op.create_index(op.f('ix_section_configs_id'), 'section_configs', ['id'], unique=False)
    op.create_index(op.f('ix_section_configs_section_type'), 'section_configs', ['section_type'], unique=False)
    op.create_index(op.f('ix_section_configs_status'), 'section_configs', ['status'], unique=False)
    op.create_index('idx_section_config_game_type_status', 'section_configs', ['game_id', 'section_type', 'status'], unique=False)
    op.create_index('idx_section_config_game_type_version', 'section_configs', ['game_id', 'section_type', 'version'], unique=False)


def downgrade() -> None:
    op.drop_index('idx_section_config_game_type_version', table_name='section_configs')
    op.drop_index('idx_section_config_game_type_status', table_name='section_configs')
    op.drop_index(op.f('ix_section_configs_status'), table_name='section_configs')
    op.drop_index(op.f('ix_section_configs_section_type'), table_name='section_configs')
    op.drop_index(op.f('ix_section_configs_id'), table_name='section_configs')
    op.drop_table('section_configs')
    
    # Drop enums
    op.execute('DROP TYPE IF EXISTS sectiontype')
    op.execute('DROP TYPE IF EXISTS sectionconfigstatus')

