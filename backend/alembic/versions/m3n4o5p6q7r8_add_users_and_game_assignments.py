"""Add users and game assignments tables

Revision ID: m3n4o5p6q7r8
Revises: l2m3n4o5p6q7
Create Date: 2025-12-03

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'm3n4o5p6q7r8'
down_revision: Union[str, None] = 'l2m3n4o5p6q7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop existing userrole type if it exists (from previous migration) and recreate with new values
    op.execute("DROP TYPE IF EXISTS userrole CASCADE")
    op.execute("CREATE TYPE userrole AS ENUM ('admin', 'game_operator')")
    
    # Create users table using the postgresql enum type directly
    op.create_table('users',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('role', postgresql.ENUM('admin', 'game_operator', name='userrole', create_type=False), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_users_id', 'users', ['id'], unique=False)
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    
    # Create user_game_assignments association table
    op.create_table('user_game_assignments',
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('game_id', sa.String(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['game_id'], ['games.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('user_id', 'game_id')
    )
    op.create_index('ix_user_game_assignments_user_id', 'user_game_assignments', ['user_id'], unique=False)
    op.create_index('ix_user_game_assignments_game_id', 'user_game_assignments', ['game_id'], unique=False)


def downgrade() -> None:
    # Drop user_game_assignments table
    op.drop_index('ix_user_game_assignments_game_id', table_name='user_game_assignments')
    op.drop_index('ix_user_game_assignments_user_id', table_name='user_game_assignments')
    op.drop_table('user_game_assignments')
    
    # Drop users table
    op.drop_index('ix_users_email', table_name='users')
    op.drop_index('ix_users_id', table_name='users')
    op.drop_table('users')
    
    # Drop the enum type
    op.execute("DROP TYPE IF EXISTS userrole")
