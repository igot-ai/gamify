# Sunstudio Configuration Management - Backend

FastAPI backend for the Sunstudio Configuration Management Portal.

## Quick Start

### Prerequisites
- Python 3.11+
- Docker & Docker Compose
- Poetry (Python package manager)

### Installation

```bash
# Install dependencies
poetry install

# Start database & Redis
cd ../infrastructure
docker-compose up -d
cd -

# Copy environment variables
cp .env.example .env
# Edit .env with your Firebase credentials

# Run migrations (TODO: after Alembic setup)
# poetry run alembic upgrade head

# Start development server
poetry run uvicorn app.main:app --reload --port 8000
```

### Access

- **API Docs (Swagger)**: http://localhost:8000/api/v1/docs
- **ReDoc**: http://localhost:8000/api/v1/redoc
- **Health Check**: http://localhost:8000/health

## Development

### Run Tests
```bash
poetry run pytest                    # All tests
poetry run pytest --cov=app          # With coverage
poetry run pytest tests/unit/ -v     # Unit only
```

### Code Quality
```bash
poetry run black .                   # Format code
poetry run ruff check .              # Lint code
poetry run mypy app/                 # Type checking
```

### Database Migrations
```bash
# TODO: Set up Alembic
# poetry run alembic revision --autogenerate -m "Description"
# poetry run alembic upgrade head
```

## Project Structure

See [BACKEND.md](../BACKEND.md) for detailed structure and progress.

## Tech Stack

- **FastAPI** - Modern async web framework
- **SQLAlchemy 2.0** - Async ORM
- **Pydantic v2** - Data validation
- **PostgreSQL** - Database
- **Firebase Admin SDK** - Remote Config integration
- **pytest** - Testing framework
