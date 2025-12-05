#!/usr/bin/env python3
"""
CLI tool for administrative tasks.

Usage:
    # Create admin user (will prompt for password)
    python -m app.cli admin@example.com "Admin User"
    
    # With password as parameter
    python -m app.cli admin@example.com "Admin User" --password secret123
    
    # With password via environment (for automation)
    ADMIN_PASSWORD=secret123 python -m app.cli admin@example.com "Admin User"
"""

import asyncio
import getpass
import os
import sys
from typing import Optional

import click
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.core.auth import get_password_hash
from app.core.config import settings
from app.models.user import User, UserRole


async def create_admin_user(
    email: str,
    name: str,
    password: str,
) -> None:
    """Create an admin user in the database."""
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Check if user already exists
        result = await session.execute(select(User).where(User.email == email))
        existing = result.scalar_one_or_none()

        if existing:
            click.echo(f"Error: User with email '{email}' already exists.", err=True)
            sys.exit(1)

        # Create admin user
        admin = User(
            email=email,
            hashed_password=get_password_hash(password),
            name=name,
            role=UserRole.admin,
        )
        session.add(admin)
        await session.commit()

        click.echo("✓ Admin user created successfully!")
        click.echo(f"  Email: {email}")
        click.echo(f"  Name: {name}")
        click.echo(f"  Role: admin")

    await engine.dispose()


def get_password_interactive() -> str:
    """Get password from interactive prompt with confirmation."""
    while True:
        password = getpass.getpass("Password: ")
        if len(password) < 6:
            click.echo("Error: Password must be at least 6 characters.", err=True)
            continue

        confirm = getpass.getpass("Confirm password: ")
        if password != confirm:
            click.echo("Error: Passwords do not match.", err=True)
            continue

        return password


def resolve_password(password: Optional[str] = None) -> str:
    """Resolve password from parameter, environment variable, or prompt."""
    # Priority: parameter > environment variable > interactive prompt
    if password:
        return password

    env_password = os.environ.get("ADMIN_PASSWORD")
    if env_password:
        click.echo("Using password from ADMIN_PASSWORD environment variable.")
        return env_password

    return get_password_interactive()


@click.command()
@click.argument("email")
@click.argument("name")
@click.option(
    "--password", "-p",
    default=None,
    help="Admin password (will prompt if not provided, or use ADMIN_PASSWORD env var)",
)
def create_admin(email: str, name: str, password: Optional[str]) -> None:
    """Create an admin user."""
    click.echo(f"\nCreating admin user: {email}")
    click.echo("-" * 40)

    resolved_password = resolve_password(password)

    asyncio.run(
        create_admin_user(
            email=email,
            name=name,
            password=resolved_password,
        )
    )


def main() -> None:
    """Main CLI entry point."""
    create_admin()


if __name__ == "__main__":
    main()
