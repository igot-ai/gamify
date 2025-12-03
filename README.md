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
cp .env.example .env  # Configure your database
poetry run alembic upgrade head
poetry run uvicorn app.main:app --reload
```

API available at `http://localhost:8000`  
Swagger docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
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

**Backend:** FastAPI, PostgreSQL, SQLAlchemy, Alembic, Pydantic  
**Frontend:** Next.js 15, TypeScript, React 19, Radix UI, Tailwind CSS  
**Infrastructure:** Docker, Nginx

## Project Structure

### Backend

```
backend/
├── app/
│   ├── api/v1/endpoints/       # API routes (auth, games, configs, users)
│   ├── core/                   # Auth, config, database, error handlers
│   ├── models/                 # SQLAlchemy models (game, section_config, user)
│   ├── schemas/                # Pydantic schemas
│   │   └── config_sections/    # Config type schemas (9 types)
│   ├── services/               # Business logic
│   ├── uploads/                # File uploads (avatars, logos)
│   ├── cli.py                  # CLI commands
│   └── main.py                 # FastAPI app entry
├── alembic/                    # Database migrations
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
│   │       └── (routes)/       # dashboard, games, sections, users
│   ├── components/
│   │   ├── config/             # Config forms (economy, ads, tutorial, etc.)
│   │   ├── layout/             # Dashboard layout, header, sidebar
│   │   └── ui/                 # Radix UI components (23 components)
│   ├── hooks/                  # Custom hooks (useGames, useSectionConfigs)
│   ├── lib/                    # API client, validations, export transforms
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
npm run lint         # Lint code
npm run test         # Run tests
```



## Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/gamify
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=60
CORS_ORIGINS=["http://localhost:3000"]
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
