# Gamify Config Portal

A unified configuration management platform for mobile games. Manage game configurations, A/B tests, and feature rollouts across multiple titles.

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL 14+
- Poetry

### Backend

```bash
cd backend
poetry install
# Create .env file with your database configuration (see Environment Variables section)
cp .env.example .env
poetry run alembic upgrade head
poetry run uvicorn app.main:app --reload
```

API available at `http://localhost:8000`  
Swagger docs: `http://localhost:8000/docs`

#### Creating the First Admin User

After setting up the backend, create your first admin user using the CLI:

```bash
cd backend
poetry run python -m app.cli admin@example.com "Admin User"
```

This will prompt you to enter and confirm a password. Alternatively, you can provide the password directly:

```bash
poetry run python -m app.cli admin@example.com "Admin User" --password your-password
```

Or use an environment variable (Linux/macOS):

```bash
ADMIN_PASSWORD=your-password poetry run python -m app.cli admin@example.com "Admin User"
```

On Windows PowerShell:

```powershell
$env:ADMIN_PASSWORD="your-password"; poetry run python -m app.cli admin@example.com "Admin User"
```

### Frontend

```bash
cd frontend
npm install
# Create .env file with your database configuration (see Environment Variables section)
cp .env.example .env
npm run dev
```

Frontend available at `http://localhost:3000`

### Docker (All Services)

```bash
cd infrastructure
docker-compose up --build
```

Access at `http://localhost:8866`

## Tech Stack

**Backend:** FastAPI, PostgreSQL, SQLAlchemy, Alembic, Pydantic, Python-JOSE, Passlib  
**Frontend:** Next.js 15, TypeScript, React 19, Radix UI, Tailwind CSS, TanStack Query, Zustand, React Hook Form, Zod  
**Infrastructure:** Docker, Nginx

## Project Structure

### Backend

```
backend/
├── app/
│   ├── api/
│   │   ├── dependencies/       # Auth dependencies, common utilities
│   │   └── v1/endpoints/       # API routes (auth, games, section_configs, users)
│   ├── core/                   # Auth, config, database, error handlers
│   ├── models/                 # SQLAlchemy models (game, section_config, user)
│   ├── schemas/                # Pydantic schemas
│   │   └── config_sections/    # Config type schemas (11 types: ad, booster, chapter_reward, economy, game, haptic, notification, remove_ads, shop, tile_bundle, tutorial)
│   ├── services/               # Business logic (auth, game, section_config, user)
│   ├── utils/                  # Utility functions (file_utils, unity_transform)
│   ├── uploads/                # File uploads (avatars, logos)
│   ├── cli.py                  # CLI commands
│   └── main.py                 # FastAPI app entry
├── alembic/                    # Database migrations
├── tests/                      # Test suite (api, services, utils)
├── Dockerfile
└── pyproject.toml              # Poetry dependencies
```

### Frontend

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Login page
│   │   └── (dashboard)/        # Protected routes
│   │       └── (routes)/       # dashboard, games, sections, settings, users
│   ├── components/
│   │   ├── config/             # Config forms (14 form types: economy, ads, tutorial, etc.)
│   │   │   ├── forms/          # Form components for each config type
│   │   │   ├── shared/         # Shared form components
│   │   │   └── ...             # Config-specific components (economy, ads, notification, etc.)
│   │   ├── layout/             # Dashboard layout, header, sidebar, game selector
│   │   ├── section/            # Section form renderer, version metadata dialog
│   │   └── ui/                 # Radix UI components (24 components)
│   ├── hooks/                  # Custom hooks (useGames, useSectionConfigs, useSelectedGame, useArrayFieldManagement)
│   ├── lib/                    # API client, validations, export transforms
│   │   ├── validations/        # Zod schemas for each config type (19 types)
│   │   └── utils/              # Utility functions (diff, etc.)
│   ├── stores/                 # Zustand stores (auth)
│   └── types/                  # TypeScript types
├── middleware.ts               # Auth protection
└── package.json
```

### Infrastructure

```
infrastructure/
├── docker-compose.yml          # Multi-container setup
└── nginx.conf                  # Reverse proxy config
```

## Config Section Types

The platform supports **19 config section types** for managing different aspects of game configuration:

1. **economy** - Currencies, IAP packages, inventory items, rewards
2. **ads** - Ad networks and placements
3. **notification** - Push and local notifications
4. **shop** - Shop items and bundles
5. **booster** - Power-ups and boosters
6. **chapter_reward** - Level progression rewards
7. **game** - Game logic and view configuration
8. **analytics** - Analytics configuration
9. **ux** - User experience settings
10. **haptic** - Haptic feedback configuration
11. **remove_ads** - Remove ads offer settings
12. **tile_bundle** - Tile bundle offer settings
13. **rating** - In-app rating prompt settings
14. **link** - Privacy and terms links
15. **game_economy** - Coin costs and rewards configuration
16. **shop_settings** - Shop enable and restore settings
17. **spin** - Spin wheel rewards and settings
18. **hint_offer** - Hint offer popup settings
19. **tutorial** - Tutorial levels and step configurations

Each section supports versioning, status management (DRAFT, IN_REVIEW, APPROVED, DEPLOYED, ARCHIVED), and Unity-compatible export transforms.

## Development

### Backend Commands

```bash
poetry run uvicorn app.main:app --reload    # Dev server
poetry run alembic revision --autogenerate  # Create migration
poetry run alembic upgrade head             # Apply migrations
poetry run pytest                           # Run tests
```

### Frontend Commands

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run start        # Production server
npm run lint         # Lint code
npm run lint:fix     # Fix linting issues
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking
```



## Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/gamify_config
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=60
CORS_ORIGINS=["http://localhost:3000"]
ENVIRONMENT=development
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## API Documentation

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

## Testing

```bash
# Backend
cd backend && poetry run pytest

# Frontend
cd frontend && npm run test
```

## License

Proprietary - Sunstudio
