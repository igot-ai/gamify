"""Cleanup unused tables and simplify workflow

Revision ID: b2c3d4e5f6g7
Revises: a1b2c3d4e5f6
Create Date: 2025-11-27 16:00:00.000000

This migration:
1. Drops environments table
2. Drops experiments and experiment_variants tables
3. Drops configs table
4. Removes review-related columns from section_configs
5. Simplifies section_configs.status enum (removes IN_REVIEW, APPROVED)
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6g7'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop configs table first (has FK to environments)
    op.drop_index('idx_config_game_env_status', table_name='configs')
    op.drop_index('idx_config_game_version', table_name='configs')
    op.drop_index(op.f('ix_configs_id'), table_name='configs')
    op.drop_index(op.f('ix_configs_status'), table_name='configs')
    op.drop_table('configs')
    
    # Drop environments table (now safe since configs is gone)
    op.drop_table('environments')
    
    # Drop experiment_variants table first (has FK to experiments)
    op.drop_table('experiment_variants')
    
    # Drop experiments table
    op.drop_table('experiments')
    
    # Remove review-related columns from section_configs
    op.drop_column('section_configs', 'reviewed_by')
    op.drop_column('section_configs', 'reviewed_at')
    op.drop_column('section_configs', 'approved_by')
    op.drop_column('section_configs', 'approved_at')
    
    # Update status enum - need to recreate it
    # First update any IN_REVIEW or APPROVED to DRAFT
    op.execute("UPDATE section_configs SET status = 'DRAFT' WHERE status IN ('IN_REVIEW', 'APPROVED')")
    
    # Create new enum type
    op.execute("CREATE TYPE sectionconfigstatus_new AS ENUM ('DRAFT', 'DEPLOYED', 'ARCHIVED')")
    
    # Alter column to use new enum
    op.execute("""
        ALTER TABLE section_configs 
        ALTER COLUMN status TYPE sectionconfigstatus_new 
        USING status::text::sectionconfigstatus_new
    """)
    
    # Drop old enum and rename new one
    op.execute("DROP TYPE sectionconfigstatus")
    op.execute("ALTER TYPE sectionconfigstatus_new RENAME TO sectionconfigstatus")
    
    # Drop old unused enums
    op.execute('DROP TYPE IF EXISTS configstatus')
    op.execute('DROP TYPE IF EXISTS experimentstatus')


def downgrade() -> None:
    # Recreate the old status enum
    op.execute("CREATE TYPE sectionconfigstatus_old AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'DEPLOYED', 'ARCHIVED')")
    op.execute("""
        ALTER TABLE section_configs 
        ALTER COLUMN status TYPE sectionconfigstatus_old 
        USING status::text::sectionconfigstatus_old
    """)
    op.execute("DROP TYPE sectionconfigstatus")
    op.execute("ALTER TYPE sectionconfigstatus_old RENAME TO sectionconfigstatus")
    
    # Add back review columns
    op.add_column('section_configs', sa.Column('reviewed_by', sa.String(), nullable=True))
    op.add_column('section_configs', sa.Column('reviewed_at', sa.DateTime(), nullable=True))
    op.add_column('section_configs', sa.Column('approved_by', sa.String(), nullable=True))
    op.add_column('section_configs', sa.Column('approved_at', sa.DateTime(), nullable=True))
    
    # Recreate configs table
    op.execute("CREATE TYPE configstatus AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'DEPLOYED', 'ARCHIVED')")
    op.create_table('configs',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('version', sa.Integer(), nullable=False),
        sa.Column('game_id', sa.String(), nullable=False),
        sa.Column('environment_id', sa.String(), nullable=True),
        sa.Column('status', sa.Enum('DRAFT', 'IN_REVIEW', 'APPROVED', 'DEPLOYED', 'ARCHIVED', name='configstatus'), nullable=False),
        sa.Column('game_core_config', sa.JSON(), nullable=True),
        sa.Column('economy_config', sa.JSON(), nullable=True),
        sa.Column('ad_config', sa.JSON(), nullable=True),
        sa.Column('notification_config', sa.JSON(), nullable=True),
        sa.Column('booster_config', sa.JSON(), nullable=True),
        sa.Column('chapter_reward_config', sa.JSON(), nullable=True),
        sa.Column('shop_config', sa.JSON(), nullable=True),
        sa.Column('analytics_config', sa.JSON(), nullable=True),
        sa.Column('ux_config', sa.JSON(), nullable=True),
        sa.Column('created_by', sa.String(), nullable=False),
        sa.Column('updated_by', sa.String(), nullable=True),
        sa.Column('reviewed_by', sa.String(), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(), nullable=True),
        sa.Column('approved_by', sa.String(), nullable=True),
        sa.Column('approved_at', sa.DateTime(), nullable=True),
        sa.Column('deployed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['game_id'], ['games.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_configs_id'), 'configs', ['id'], unique=False)
    op.create_index(op.f('ix_configs_status'), 'configs', ['status'], unique=False)
    op.create_index('idx_config_game_version', 'configs', ['game_id', 'version'], unique=False)
    op.create_index('idx_config_game_env_status', 'configs', ['game_id', 'environment_id', 'status'], unique=False)
    
    # Recreate experiments table
    op.execute("CREATE TYPE experimentstatus AS ENUM ('DRAFT', 'RUNNING', 'PAUSED', 'COMPLETED', 'ARCHIVED')")
    op.create_table('experiments',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('game_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('hypothesis', sa.String(), nullable=True),
        sa.Column('status', sa.Enum('DRAFT', 'RUNNING', 'PAUSED', 'COMPLETED', 'ARCHIVED', name='experimentstatus'), nullable=False),
        sa.Column('targeting', sa.JSON(), nullable=False),
        sa.Column('schedule', sa.JSON(), nullable=False),
        sa.Column('metrics', sa.JSON(), nullable=False),
        sa.Column('created_by', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['game_id'], ['games.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_experiment_game_status', 'experiments', ['game_id', 'status'], unique=False)
    
    # Recreate experiment_variants table
    op.create_table('experiment_variants',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('experiment_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('is_control', sa.Boolean(), nullable=False),
        sa.Column('weight', sa.Integer(), nullable=False),
        sa.Column('config_overrides', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['experiment_id'], ['experiments.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Recreate environments table
    op.create_table('environments',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('game_id', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['game_id'], ['games.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('game_id', 'name', name='uq_game_environment')
    )

