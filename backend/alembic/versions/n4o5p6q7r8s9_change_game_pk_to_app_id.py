"""Change game primary key from id to app_id

Revision ID: n4o5p6q7r8s9
Revises: m3n4o5p6q7r8
Create Date: 2025-12-04

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision: str = 'n4o5p6q7r8s9'
down_revision: Union[str, None] = 'm3n4o5p6q7r8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    
    # Step 1: Drop ALL foreign key constraints that reference games table
    # Using dynamic lookup to handle any constraint naming
    conn.execute(text("""
        DO $$
        DECLARE
            r RECORD;
        BEGIN
            FOR r IN (
                SELECT conname, conrelid::regclass as tablename
                FROM pg_constraint
                WHERE confrelid = 'games'::regclass AND contype = 'f'
            ) LOOP
                EXECUTE 'ALTER TABLE ' || r.tablename || ' DROP CONSTRAINT ' || r.conname;
            END LOOP;
        END $$;
    """))
    
    # Step 2: Delete orphan records (records that reference non-existent games)
    conn.execute(text("""
        DELETE FROM section_configs 
        WHERE game_id NOT IN (SELECT id FROM games)
    """))
    
    conn.execute(text("""
        DELETE FROM user_game_assignments 
        WHERE game_id NOT IN (SELECT id FROM games)
    """))
    
    # Step 3: Update game_id values from old UUID to app_id
    conn.execute(text("""
        UPDATE section_configs sc
        SET game_id = g.app_id
        FROM games g
        WHERE sc.game_id = g.id
    """))
    
    conn.execute(text("""
        UPDATE user_game_assignments uga
        SET game_id = g.app_id
        FROM games g
        WHERE uga.game_id = g.id
    """))
    
    # Step 4: Drop games table constraints and indexes
    conn.execute(text("DROP INDEX IF EXISTS ix_games_id"))
    conn.execute(text("DROP INDEX IF EXISTS ix_games_app_id"))
    conn.execute(text("ALTER TABLE games DROP CONSTRAINT IF EXISTS games_pkey"))
    
    # Step 5: Make app_id the primary key and drop old id column
    conn.execute(text("ALTER TABLE games ADD PRIMARY KEY (app_id)"))
    conn.execute(text("ALTER TABLE games DROP COLUMN id"))
    
    # Step 6: Recreate foreign keys to reference games.app_id
    op.create_foreign_key(
        'section_configs_game_id_fkey',
        'section_configs', 'games',
        ['game_id'], ['app_id'],
        ondelete='CASCADE'
    )
    op.create_foreign_key(
        'user_game_assignments_game_id_fkey',
        'user_game_assignments', 'games',
        ['game_id'], ['app_id'],
        ondelete='CASCADE'
    )


def downgrade() -> None:
    conn = op.get_bind()
    
    # Step 1: Add back the id column
    op.add_column('games', sa.Column('id', sa.String(), nullable=True))
    
    # Step 2: Generate UUIDs for the id column
    conn.execute(text("UPDATE games SET id = gen_random_uuid()::text"))
    
    # Step 3: Make id not nullable
    op.alter_column('games', 'id', nullable=False)
    
    # Step 4: Drop the foreign keys referencing app_id
    op.drop_constraint('section_configs_game_id_fkey', 'section_configs', type_='foreignkey')
    op.drop_constraint('user_game_assignments_game_id_fkey', 'user_game_assignments', type_='foreignkey')
    
    # Step 5: Change primary key from app_id to id
    conn.execute(text("ALTER TABLE games DROP CONSTRAINT games_pkey"))
    conn.execute(text("ALTER TABLE games ADD PRIMARY KEY (id)"))
    op.create_index('ix_games_id', 'games', ['id'], unique=False)
    op.create_index('ix_games_app_id', 'games', ['app_id'], unique=True)
    
    # Step 6: Update related tables to use new id values
    conn.execute(text("""
        UPDATE section_configs sc
        SET game_id = g.id
        FROM games g
        WHERE sc.game_id = g.app_id
    """))
    
    conn.execute(text("""
        UPDATE user_game_assignments uga
        SET game_id = g.id
        FROM games g
        WHERE uga.game_id = g.app_id
    """))
    
    # Step 7: Recreate foreign keys to reference games.id
    op.create_foreign_key(
        'section_configs_game_id_fkey',
        'section_configs', 'games',
        ['game_id'], ['id'],
        ondelete='CASCADE'
    )
    op.create_foreign_key(
        'user_game_assignments_game_id_fkey',
        'user_game_assignments', 'games',
        ['game_id'], ['id'],
        ondelete='CASCADE'
    )
