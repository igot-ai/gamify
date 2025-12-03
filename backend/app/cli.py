#!/usr/bin/env python3
"""
CLI tool for administrative tasks.

Usage:
    # Create admin user (will prompt for password)
    python -m app.cli create-admin --email admin@example.com --name "Admin User"
    
    # With password via environment (for automation)
    ADMIN_PASSWORD=secret123 python -m app.cli create-admin --email admin@example.com --name "Admin"
"""

import argparse
import asyncio
import getpass
import os
import sys
from typing import Optional

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
            print(f"Error: User with email '{email}' already exists.")
            sys.exit(1)

        # Create admin user
        admin = User(
            email=email,
            hashed_password=get_password_hash(password),
            name=name,
            role=UserRole.admin,
            is_active=True,
        )
        session.add(admin)
        await session.commit()

        print(f"✓ Admin user created successfully!")
        print(f"  Email: {email}")
        print(f"  Name: {name}")
        print(f"  Role: admin")

    await engine.dispose()


def get_password_interactive() -> str:
    """Get password from user input or environment variable."""
    # Check environment variable first (for CI/CD automation)
    env_password = os.environ.get("ADMIN_PASSWORD")
    if env_password:
        print("Using password from ADMIN_PASSWORD environment variable.")
        return env_password

    # Interactive prompt
    while True:
        password = getpass.getpass("Password: ")
        if len(password) < 6:
            print("Error: Password must be at least 6 characters.")
            continue

        confirm = getpass.getpass("Confirm password: ")
        if password != confirm:
            print("Error: Passwords do not match.")
            continue

        return password


def cmd_create_admin(args: argparse.Namespace) -> None:
    """Handle create-admin command."""
    print(f"\nCreating admin user: {args.email}")
    print("-" * 40)

    password = get_password_interactive()

    asyncio.run(create_admin_user(
        email=args.email,
        name=args.name,
        password=password,
    ))


def main() -> None:
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        prog="python -m app.cli",
        description="Gamify Config API - Administrative CLI",
    )
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # create-admin command
    admin_parser = subparsers.add_parser(
        "create-admin",
        help="Create an admin user",
    )
    admin_parser.add_argument(
        "--email",
        required=True,
        help="Admin email address",
    )
    admin_parser.add_argument(
        "--name",
        required=True,
        help="Admin display name",
    )

    args = parser.parse_args()

    if args.command == "create-admin":
        cmd_create_admin(args)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()

