"""Drop audit_logs and users tables

Revision ID: l2m3n4o5p6q7
Revises: k1l2m3n4o5p6
Create Date: 2025-12-03

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'l2m3n4o5p6q7'
down_revision: Union[str, None] = 'k1l2m3n4o5p6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop audit_logs table
    op.drop_table('audit_logs', if_exists=True)
    
    # Drop users table
    op.drop_table('users', if_exists=True)
    
    # Drop the enum types
    op.execute("DROP TYPE IF EXISTS auditaction")
    op.execute("DROP TYPE IF EXISTS userrole")


def downgrade() -> None:
    # Recreate users table
    op.create_table('users',
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('role', sa.Enum('DESIGNER', 'LEAD_DESIGNER', 'PRODUCT_MANAGER', 'ADMIN', name='userrole'), nullable=False),
        sa.Column('game_access', sa.JSON(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_index('ix_users_id', 'users', ['id'], unique=False)
    op.create_index('ix_users_role', 'users', ['role'], unique=False)
    
    # Recreate audit_logs table
    op.create_table('audit_logs',
        sa.Column('entity_type', sa.String(), nullable=False),
        sa.Column('entity_id', sa.String(), nullable=False),
        sa.Column('action', sa.Enum('CREATE', 'UPDATE', 'DELETE', 'DEPLOY', 'ROLLBACK', 'APPROVE', 'REJECT', 'SUBMIT', name='auditaction'), nullable=False),
        sa.Column('changes', sa.JSON(), nullable=True),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('audit_metadata', sa.JSON(), nullable=True),
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_audit_entity_timestamp', 'audit_logs', ['entity_id', 'created_at'], unique=False)
    op.create_index('idx_audit_user_timestamp', 'audit_logs', ['user_id', 'created_at'], unique=False)
    op.create_index('ix_audit_logs_action', 'audit_logs', ['action'], unique=False)
    op.create_index('ix_audit_logs_entity_type', 'audit_logs', ['entity_type'], unique=False)
    op.create_index('ix_audit_logs_id', 'audit_logs', ['id'], unique=False)
    op.create_index('ix_audit_logs_user_id', 'audit_logs', ['user_id'], unique=False)
