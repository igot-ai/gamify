# Infrastructure Setup with Docker Compose

This directory contains the Docker Compose configuration for running the entire gamify-config application stack with nginx as a reverse proxy.

## Architecture

- **Nginx** (Port 8866): Reverse proxy serving frontend and proxying `/api/*` requests to backend
- **Backend** (Internal): FastAPI application running on port 8000 (not exposed externally)
- **Frontend** (Internal): Next.js application running on port 3000 (not exposed externally)
- **PostgreSQL** (Internal): Database on port 5432
- **Redis** (Internal): Cache/queue on port 6379
- **PgAdmin** (Port 5050): Database management UI (optional)

All external traffic goes through Nginx, which provides:
- Unified access point for frontend and backend
- Automatic routing of API requests to backend with `/api` prefix
- Load balancing and connection pooling
- SSL termination (in production)

## Prerequisites

- Docker and Docker Compose installed
- Firebase service account JSON file (for backend)

## Setup

1. **Prepare Firebase credentials:**
   ```bash
   # Place your Firebase service account JSON file in the backend directory
   cp /path/to/firebase-service-account.json backend/firebase-service-account.json
   ```

2. **Set environment variables:**
   Create a `.env` file in the `infrastructure` directory (optional):
   ```env
   SECRET_KEY=your-secret-key-here
   FIREBASE_PROJECT_ID=your-firebase-project-id
   ```

3. **Build and start all services:**
   ```bash
   cd infrastructure
   docker-compose up --build
   ```

4. **Access the application:**
   - Frontend + API: http://localhost:8866
   - PgAdmin: http://localhost:5050

## API Routing via Nginx

The nginx reverse proxy provides a unified access point for both frontend and backend:

```
Browser Request              Nginx Routing                 Destination
─────────────────           ──────────────               ─────────────
http://localhost:8866/   →  Proxy to frontend    →      http://frontend:3000/
http://localhost:8866/api → Proxy to backend     →      http://backend:8000/api
```

### How It Works

1. **Frontend Requests**: The Next.js application makes API calls to `/api/v1/*` (relative path)
2. **Nginx Intercepts**: Nginx matches the `/api` prefix and routes to the backend container
3. **Backend Receives**: FastAPI backend receives the full path `/api/v1/*` and processes the request
4. **Response**: Backend response flows back through Nginx to the frontend

### Benefits

- ✅ No CORS issues - same origin for frontend and backend
- ✅ Simplified deployment - single port exposure
- ✅ Better security - backend not directly accessible
- ✅ Easy SSL/TLS termination in production
- ✅ Centralized logging and monitoring

## Development vs Production

### Development Mode (Local)
```bash
# Frontend and backend run separately
npm run dev          # Frontend on http://localhost:3000
poetry run uvicorn   # Backend on http://localhost:8000

# Frontend configured with full URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Production Mode (Docker)
```bash
# All services behind nginx
docker-compose up

# Frontend uses relative path (no NEXT_PUBLIC_API_URL set)
# Automatically uses /api/v1 which nginx proxies to backend
# Access everything through: http://localhost:8866
```

## Services

### Nginx (Reverse Proxy)
- Listens on port 8866 (mapped to container port 80)
- Routes `/api/*` requests to backend container
- Routes all other requests to frontend container
- Configuration: `nginx.conf`
- No direct file serving - proxies to Next.js for SSR support

### Frontend (Next.js)
- Builds from `frontend/Dockerfile`
- Runs Next.js in standalone mode on port 3000 (internal)
- Handles SSR, API routes, and static file serving
- Environment: No `NEXT_PUBLIC_API_URL` set (uses relative paths)

### Backend (FastAPI)
- Builds from `backend/Dockerfile`
- Runs database migrations on startup
- Exposes port 8000 internally only (not accessible externally)
- API prefix: `/api/v1`

### Database & Cache
- PostgreSQL: Persistent data storage
- Redis: Caching and session management

## Volumes

- `postgres_data`: PostgreSQL data persistence

## Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up --build -d

# Access backend container
docker-compose exec backend bash

# Access nginx container
docker-compose exec nginx sh

# Run database migrations manually
docker-compose exec backend poetry run alembic upgrade head
```

## Troubleshooting

1. **Frontend not loading:**
   - Check if frontend container built successfully: `docker-compose logs frontend`
   - Verify nginx can access frontend files: `docker-compose exec nginx ls -la /usr/share/nginx/html`

2. **API requests failing:**
   - Check backend logs: `docker-compose logs backend`
   - Verify nginx proxy configuration: `docker-compose exec nginx cat /etc/nginx/conf.d/default.conf`
   - Test backend directly: `docker-compose exec backend curl http://localhost:8000/health`

3. **Database connection issues:**
   - Ensure postgres is healthy: `docker-compose ps postgres`
   - Check database URL in backend environment variables

4. **Firebase errors:**
   - Verify Firebase credentials volume is mounted correctly
   - Check file permissions: `docker-compose exec backend ls -la /app/firebase-service-account.json`

