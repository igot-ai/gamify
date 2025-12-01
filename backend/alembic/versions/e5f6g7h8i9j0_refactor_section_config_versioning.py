"""Refactor section config versioning to single record with version history

Revision ID: e5f6g7h8i9j0
Revises: d4e5f6g7h8i9
Create Date: 2025-11-28 10:00:00.000000

This migration transforms the section_configs table from multiple version records
to a single record per game+section with separate version history table.

Before: Each version is a separate record with status (DRAFT/DEPLOYED/ARCHIVED)
After: One record per game+section with draft_data, published_data, and version history
"""
from typing import Sequence, Union
from datetime import datetime

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision: str = 'e5f6g7h8i9j0'
down_revision: Union[str, None] = 'd4e5f6g7h8i9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    
    # Safety cleanup in case migration was partially run before
    conn.execute(text("DROP TABLE IF EXISTS section_configs_new CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS section_config_versions CASCADE"))
    
    # Step 1: Create section_config_versions table
    op.create_table('section_config_versions',
        sa.Column('section_config_id', sa.String(), nullable=False),
        sa.Column('version', sa.Integer(), nullable=False),
        sa.Column('config_data', sa.JSON(), nullable=True),
        sa.Column('published_at', sa.DateTime(), nullable=False),
        sa.Column('published_by', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('section_config_id', 'version', name='uq_section_config_version')
    )
    op.create_index(op.f('ix_section_config_versions_id'), 'section_config_versions', ['id'], unique=False)
    op.create_index('idx_section_config_version_config_id', 'section_config_versions', ['section_config_id'], unique=False)
    op.create_index('idx_section_config_version_version', 'section_config_versions', ['section_config_id', 'version'], unique=False)
    
    # Step 2: Create temporary table with new schema using raw SQL to avoid enum recreation
    conn.execute(text("""
        CREATE TABLE section_configs_new (
            id VARCHAR NOT NULL PRIMARY KEY,
            game_id VARCHAR NOT NULL REFERENCES games(id) ON DELETE CASCADE,
            section_type sectiontype NOT NULL,
            draft_data JSON,
            draft_updated_at TIMESTAMP,
            draft_updated_by VARCHAR,
            published_data JSON,
            published_version INTEGER,
            published_at TIMESTAMP,
            published_by VARCHAR,
            has_unpublished_changes BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMP NOT NULL,
            updated_at TIMESTAMP NOT NULL,
            CONSTRAINT uq_section_config_game_type UNIQUE (game_id, section_type)
        )
    """))
    
    # Step 3: Migrate data - for each unique (game_id, section_type) combination
    # Get all unique game_id + section_type combinations
    result = conn.execute(text("""
        SELECT DISTINCT game_id, section_type 
        FROM section_configs 
        ORDER BY game_id, section_type
    """))
    combinations = result.fetchall()
    
    import uuid
    
    for game_id, section_type in combinations:
        new_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        # Get the latest version (highest version number) for draft_data
        latest_result = conn.execute(text("""
            SELECT id, config_data, updated_at, COALESCE(updated_by, created_by) as updated_by, version
            FROM section_configs 
            WHERE game_id = :game_id AND section_type = :section_type
            ORDER BY version DESC
            LIMIT 1
        """), {"game_id": game_id, "section_type": section_type})
        latest = latest_result.fetchone()
        
        # Get the deployed version (if any) for published_data
        deployed_result = conn.execute(text("""
            SELECT config_data, version, deployed_at, COALESCE(updated_by, created_by) as deployed_by
            FROM section_configs 
            WHERE game_id = :game_id AND section_type = :section_type AND status = 'DEPLOYED'
            ORDER BY version DESC
            LIMIT 1
        """), {"game_id": game_id, "section_type": section_type})
        deployed = deployed_result.fetchone()
        
        # Get the earliest created_at for the new record
        earliest_result = conn.execute(text("""
            SELECT MIN(created_at) as created_at
            FROM section_configs 
            WHERE game_id = :game_id AND section_type = :section_type
        """), {"game_id": game_id, "section_type": section_type})
        earliest = earliest_result.fetchone()
        
        # Determine has_unpublished_changes
        # If latest version is a draft (not deployed), there are unpublished changes
        has_unpublished = False
        if latest:
            draft_check = conn.execute(text("""
                SELECT status FROM section_configs 
                WHERE game_id = :game_id AND section_type = :section_type AND version = :version
            """), {"game_id": game_id, "section_type": section_type, "version": latest[4]})
            draft_status = draft_check.fetchone()
            if draft_status and draft_status[0] == 'DRAFT':
                has_unpublished = True
        
        # Insert new consolidated record
        import json
        draft_data_json = json.dumps(latest[1]) if latest and latest[1] else None
        published_data_json = json.dumps(deployed[0]) if deployed and deployed[0] else None
        
        conn.execute(text("""
            INSERT INTO section_configs_new 
            (id, game_id, section_type, draft_data, draft_updated_at, draft_updated_by,
             published_data, published_version, published_at, published_by,
             has_unpublished_changes, created_at, updated_at)
            VALUES 
            (:id, :game_id, :section_type, :draft_data, :draft_updated_at, :draft_updated_by,
             :published_data, :published_version, :published_at, :published_by,
             :has_unpublished_changes, :created_at, :updated_at)
        """), {
            "id": new_id,
            "game_id": game_id,
            "section_type": section_type,
            "draft_data": draft_data_json,
            "draft_updated_at": latest[2] if latest else None,
            "draft_updated_by": latest[3] if latest else None,
            "published_data": published_data_json,
            "published_version": deployed[1] if deployed else None,
            "published_at": deployed[2] if deployed else None,
            "published_by": deployed[3] if deployed else None,
            "has_unpublished_changes": has_unpublished,
            "created_at": earliest[0] if earliest else now,
            "updated_at": now,
        })
        
        # Insert all deployed/archived versions into version history
        # (only versions that were actually published at some point)
        versions_result = conn.execute(text("""
            SELECT config_data, version, deployed_at, COALESCE(updated_by, created_by) as published_by,
                   created_at, updated_at
            FROM section_configs 
            WHERE game_id = :game_id AND section_type = :section_type 
            AND status IN ('DEPLOYED', 'ARCHIVED')
            AND deployed_at IS NOT NULL
            ORDER BY version ASC
        """), {"game_id": game_id, "section_type": section_type})
        
        for ver in versions_result.fetchall():
            version_id = str(uuid.uuid4())
            version_data_json = json.dumps(ver[0]) if ver[0] else None
            conn.execute(text("""
                INSERT INTO section_config_versions
                (id, section_config_id, version, config_data, published_at, published_by, 
                 description, created_at, updated_at)
                VALUES
                (:id, :section_config_id, :version, :config_data, :published_at, :published_by,
                 :description, :created_at, :updated_at)
            """), {
                "id": version_id,
                "section_config_id": new_id,
                "version": ver[1],
                "config_data": version_data_json,
                "published_at": ver[2] or now,
                "published_by": ver[3] or "system",
                "description": None,
                "created_at": ver[4],
                "updated_at": ver[5],
            })
    
    # Step 4: Drop old table and rename new one
    op.drop_index('idx_section_config_game_type_version', table_name='section_configs')
    op.drop_index('idx_section_config_game_type_status', table_name='section_configs')
    op.drop_index(op.f('ix_section_configs_status'), table_name='section_configs')
    op.drop_index(op.f('ix_section_configs_section_type'), table_name='section_configs')
    op.drop_index(op.f('ix_section_configs_id'), table_name='section_configs')
    op.drop_constraint('uq_section_config_game_type_version', 'section_configs', type_='unique')
    op.drop_table('section_configs')
    
    op.rename_table('section_configs_new', 'section_configs')
    
    # Step 5: Add indexes to renamed table
    op.create_index(op.f('ix_section_configs_id'), 'section_configs', ['id'], unique=False)
    op.create_index(op.f('ix_section_configs_section_type'), 'section_configs', ['section_type'], unique=False)
    op.create_index('idx_section_config_game_type', 'section_configs', ['game_id', 'section_type'], unique=False)
    
    # Step 6: Add foreign key constraint to section_config_versions
    op.create_foreign_key(
        'fk_section_config_versions_section_config_id',
        'section_config_versions',
        'section_configs',
        ['section_config_id'],
        ['id'],
        ondelete='CASCADE'
    )
    
    # Step 7: Drop unused enum (sectionconfigstatus)
    op.execute('DROP TYPE IF EXISTS sectionconfigstatus')


def downgrade() -> None:
    # This is a complex migration - downgrade would require significant work
    # For safety, we don't provide automatic downgrade
    raise NotImplementedError(
        "Downgrade not supported for this migration. "
        "Please restore from backup if you need to revert."
    )

