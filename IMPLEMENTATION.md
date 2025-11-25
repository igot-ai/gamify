# Sunstudio Configuration Management Portal - Implementation Plan

## Overview

Building a production-ready web portal to replace the manual Notion → Firebase Remote Config workflow with a centralized, safe, and efficient configuration management system supporting A/B testing, release management, and multi-game operations.

**Architecture**: FastAPI (Python) backend + React (TypeScript) frontend for optimal TDD workflow and engineer-friendly development.

## Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.11+) with async/await
- **Database**: PostgreSQL with SQLAlchemy 2.0 ORM
- **Schema Validation**: Pydantic v2 models (runtime validation)
- **Authentication**: Firebase Admin SDK (Python) + JWT
- **Testing**: pytest + pytest-cov + pytest-asyncio + Faker
- **API Docs**: Auto-generated OpenAPI/Swagger

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui + Radix UI + TailwindCSS
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **API Client**: Axios

### Infrastructure
- **Backend Hosting**: Cloud Run, Railway, or any Python ASGI host
- **Frontend Hosting**: Vercel or Netlify
- **Database**: PostgreSQL (managed service)
- **Cache/Jobs**: Redis
- **CI/CD**: GitHub Actions

## Development Phases

### Phase 1: MVP Foundation (Weeks 1-6) ✅ CURRENT PHASE

**Goals**:
- User authentication with Firebase Auth
- Basic config CRUD for one game
- Firebase Remote Config sync (read/write)
- Simple approval workflow (draft → review → deploy)
- Audit logging
- Single environment (production)

**Backend Tasks**:
- [x] Project structure setup
- [x] Database schema with SQLAlchemy models
- [x] Pydantic schemas for validation
- [x] FastAPI endpoints (games, configs, auth)
- [x] Firebase Admin SDK integration
- [ ] pytest test suite (unit + integration)
- [ ] Docker Compose for local development
- [ ] Alembic migrations setup

**Frontend Tasks** (for Frontend Agent):
- [ ] Vite + React + TypeScript setup
- [ ] shadcn/ui components installation
- [ ] Authentication flow with Firebase
- [ ] Config editor UI (Economy, Ads, Notifications sections)
- [ ] Config list and detail views
- [ ] Approval workflow UI
- [ ] API client with TanStack Query

**Success Criteria**: Product team can edit and deploy configs without engineering help

---

### Phase 2: A/B Testing (Weeks 7-10)

**Goals**:
- Experiment creation and management
- Variant configuration
- User segmentation and targeting
- Firebase Conditions integration
- Basic analytics dashboard

**Backend Tasks**:
- [ ] Experiment models and schemas
- [ ] A/B testing endpoints
- [ ] Firebase Remote Config Conditions integration
- [ ] Experiment lifecycle management
- [ ] Tests for experiment flow

**Frontend Tasks**:
- [ ] Experiment wizard (multi-step form)
- [ ] Variant editor UI
- [ ] Targeting rules configuration
- [ ] Metrics selector
- [ ] Experiment results dashboard

**Success Criteria**: Run first A/B test end-to-end through portal

---

### Phase 3: Multi-Game & Environments (Weeks 11-13)

**Goals**:
- Multi-tenant architecture
- Environment management (dev/staging/prod)
- Configuration templates
- Bulk operations
- Advanced permissions

**Backend Tasks**:
- [ ] Multi-game isolation logic
- [ ] Environment-aware queries
- [ ] Config promotion endpoints
- [ ] Template management
- [ ] Enhanced permission system

**Frontend Tasks**:
- [ ] Environment selector UI
- [ ] Environment comparison view
- [ ] Config promotion workflow
- [ ] Multi-game dashboard
- [ ] Template library

**Success Criteria**: All games migrated to portal

---

### Phase 4: Advanced Features (Weeks 14-19)

**Goals**:
- Scheduled releases
- Gradual rollouts with automatic rollback
- Configuration diffing and comparison
- Advanced analytics integration
- API for programmatic access

**Backend Tasks**:
- [ ] Celery job queue setup
- [ ] Scheduled release jobs
- [ ] Gradual rollout engine
- [ ] Rollback monitoring
- [ ] Public API endpoints with API keys

**Frontend Tasks**:
- [ ] Release calendar
- [ ] Scheduling UI
- [ ] Rollout progress monitoring
- [ ] Advanced diff viewer
- [ ] Analytics integration

**Success Criteria**: Zero-downtime releases with full observability

---

## Backend API Contract

### Base URL
- Development: `http://localhost:8000/api/v1`
- Production: `https://api.config.sunstudio.com/api/v1`

### Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer <firebase_id_token>
```

### Core Endpoints

#### Games
```
GET    /games                    # List all games
POST   /games                    # Create new game
GET    /games/{game_id}          # Get game details
PATCH  /games/{game_id}          # Update game
DELETE /games/{game_id}          # Delete game
```

#### Configurations
```
GET    /configs                  # List configs (filter by game_id, environment, status)
POST   /configs                  # Create new config draft
GET    /configs/{config_id}      # Get config details
PATCH  /configs/{config_id}      # Update config (DRAFT only)
DELETE /configs/{config_id}      # Delete config

POST   /configs/{config_id}/submit-review   # Submit for review
POST   /configs/{config_id}/approve          # Approve config (LEAD_DESIGNER+)
POST   /configs/{config_id}/reject           # Reject config
POST   /configs/{config_id}/deploy           # Deploy to Firebase (PRODUCT_MANAGER+)
POST   /configs/{config_id}/rollback         # Rollback to previous version
```

#### Firebase Sync
```
GET    /firebase/import/{game_id}          # Import from Firebase Remote Config
POST   /firebase/deploy/{config_id}        # Deploy config to Firebase
GET    /firebase/status/{game_id}          # Check Firebase sync status
```

#### Experiments (Phase 2)
```
GET    /experiments                         # List experiments
POST   /experiments                         # Create experiment
GET    /experiments/{experiment_id}         # Get experiment
PATCH  /experiments/{experiment_id}         # Update experiment
POST   /experiments/{experiment_id}/start   # Start experiment
POST   /experiments/{experiment_id}/pause   # Pause experiment
POST   /experiments/{experiment_id}/complete # Complete experiment
```

#### Audit Logs
```
GET    /audit-logs                          # List audit logs (filter by entity_id, user_id)
GET    /audit-logs/{log_id}                 # Get audit log details
```

#### Users
```
GET    /users                               # List users
POST   /users                               # Create user
GET    /users/{user_id}                     # Get user
PATCH  /users/{user_id}                     # Update user role/permissions
```

### Response Formats

**Success Response**:
```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2025-11-25T12:56:00Z"
  }
}
```

**Error Response**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid configuration data",
    "details": [
      {
        "field": "economy_config.currencies",
        "message": "At least one currency is required"
      }
    ]
  }
}
```

### Data Models

See Pydantic schemas in `/backend/app/schemas/` for complete data models.

**Key Models**:
- `GameConfig` - Complete configuration with all sections
- `EconomyConfig` - Currency, IAP, rewards configuration
- `AdConfig` - Advertisement network and placement settings
- `NotificationConfig` - Push notification configuration
- `Experiment` - A/B test definition
- `AuditLog` - Change history record

---

## Database Schema

See SQLAlchemy models in `/backend/app/models/` for complete schema.

**Key Tables**:
- `games` - Game definitions
- `environments` - Environment configurations per game
- `configs` - Configuration versions with JSONB columns
- `experiments` - A/B test definitions
- `experiment_variants` - Experiment variant configurations
- `audit_logs` - Full audit trail
- `users` - User accounts and permissions

**Indexes**:
- `configs`: `(game_id, environment_id, status)` for fast filtering
- `audit_logs`: `(entity_id, timestamp)`, `(user_id, timestamp)`
- `experiments`: `(game_id, status)`

---

## Testing Strategy

### Backend Testing (pytest)

**Unit Tests** (`tests/unit/`):
- Pydantic schema validation
- Service layer business logic
- Firebase template conversion
- Permission functions

**Integration Tests** (`tests/integration/`):
- FastAPI endpoints with test database
- Full workflow tests (create → approve → deploy)
- Firebase SDK integration (mocked)
- Audit log verification

**Test Coverage Target**: >85%

**Running Tests**:
```bash
cd backend
poetry run pytest                    # All tests
poetry run pytest tests/unit/        # Unit only
poetry run pytest -v --cov=app       # With coverage
```

### Frontend Testing (for Frontend Agent)

**Unit Tests** (Vitest):
- Component rendering
- Form validation
- Utility functions

**Integration Tests**:
- API client integration
- User workflows

**E2E Tests** (Playwright):
- Complete user journeys
- Cross-browser testing

---

## Development Workflow

### Backend Development

1. **Local Setup**:
```bash
cd backend
poetry install
docker-compose up -d  # Start PostgreSQL & Redis
poetry run alembic upgrade head  # Run migrations
poetry run uvicorn app.main:app --reload  # Start dev server
```

2. **TDD Workflow**:
- Write test first (Red)
- Implement feature (Green)
- Refactor (Refactor)
- Run full test suite before commit

3. **API Documentation**:
- Auto-generated at `http://localhost:8000/api/docs`
- Keep examples updated in Pydantic models

### Frontend Development (for Frontend Agent)

1. **Local Setup**:
```bash
cd frontend
npm install
npm run dev  # Start Vite dev server
```

2. **API Integration**:
- Use TanStack Query for all API calls
- Centralize API client in `/src/api/`
- Handle loading/error states consistently

3. **Component Development**:
- Use shadcn/ui components
- Follow atomic design pattern
- Keep components focused and reusable

---

## Deployment

### Backend Deployment

**Option 1: Google Cloud Run** (Recommended)
```bash
gcloud run deploy config-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

**Option 2: Railway**
- Connect GitHub repo
- Auto-deploy on push to main
- Add PostgreSQL add-on

### Frontend Deployment

**Vercel** (Recommended):
- Connect GitHub repo
- Set environment variable: `VITE_API_URL=https://api.config.sunstudio.com`
- Auto-deploy on merge to main

---

## Security Considerations

1. **Authentication**: Firebase Auth tokens verified on every request
2. **Authorization**: Role-based permissions enforced at API level
3. **Audit Trail**: All changes logged with user info
4. **Secrets**: Firebase credentials in environment variables, never committed
5. **CORS**: Restricted to frontend domains only
6. **Rate Limiting**: Implement per-user API limits (Phase 4)

---

## Migration Strategy

1. **Week 1-2**: Internal testing with dev/staging environments
2. **Week 3**: UAT with 1 pilot game (non-critical)
3. **Week 4**: Migrate 2-3 more games
4. **Week 5-6**: Migrate all remaining games
5. **Week 7**: Restrict Firebase console access, portal as source of truth

---

## Success Metrics

### Operational Efficiency
- **Time to Deploy**: < 5 minutes (from approval to live)
- **Config Change Frequency**: Enable daily iterations
- **Error Rate**: < 0.1% of deployments cause issues

### Product Velocity
- **Experiment Throughput**: 5+ concurrent A/B tests per game
- **Feature Flag Usage**: 20+ active flags per game

### Business Impact
- **Revenue Optimization**: 5-10% lift from A/B tested economy changes
- **Retention**: Improved D1/D7 retention from notification optimization

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-25  
**Status**: Phase 1 - Backend Implementation In Progress
