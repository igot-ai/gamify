# Infrastructure Setup Summary

## Changes Made

### 1. Frontend API Configuration (`frontend/src/lib/api.ts`)
- Updated to use relative path `/api/v1` in production mode
- Automatically detects if `VITE_API_URL` is a full URL (development) or uses relative path (production)
- Allows nginx to handle API routing seamlessly

### 2. Nginx Configuration (`infrastructure/nginx.conf`)
- Serves frontend static files from `/usr/share/nginx/html`
- Proxies `/api/*` requests to backend service
- Includes proper headers for proxy requests
- Health check endpoint at `/health`

### 3. Docker Compose Setup (`infrastructure/docker-compose.yml`)
- **Backend service**: FastAPI application with auto-migrations
- **Frontend service**: Builds React app and outputs to shared volume
- **Nginx service**: Reverse proxy serving frontend and proxying API
- **PostgreSQL**: Database service
- **Redis**: Cache/queue service
- **PgAdmin**: Database management UI (optional)

### 4. Dockerfiles
- **Backend Dockerfile**: Multi-stage build with Poetry, runs migrations on startup
- **Frontend Dockerfile**: Builds React app, outputs to `/app/dist`

### 5. Network Architecture
- All services on `gamify_network` bridge network
- Backend accessible only internally (via nginx proxy)
- Frontend served by nginx
- External access only through nginx (port 80)

## How It Works

1. **Frontend Build**: Frontend container builds React app and outputs to `/app/dist`
2. **Volume Sharing**: Files are copied to `frontend_dist` named volume
3. **Nginx Serving**: Nginx mounts the same volume and serves files from `/usr/share/nginx/html`
4. **API Proxying**: When frontend makes requests to `/api/v1/*`, nginx proxies them to `http://backend:8000/api/v1/*`

## Usage

```bash
# Start everything
cd infrastructure
docker-compose up --build

# Access application
# Frontend + API: http://localhost
# PgAdmin: http://localhost:5050
```

## Environment Variables

Set in `infrastructure/.env` or docker-compose.yml:
- `SECRET_KEY`: Backend secret key
- `FIREBASE_PROJECT_ID`: Firebase project ID
- `FIREBASE_SERVICE_ACCOUNT_PATH`: Path to Firebase credentials (mounted as volume)

## Benefits

1. **Single Entry Point**: All traffic goes through nginx (port 80)
2. **No CORS Issues**: Frontend and API on same origin
3. **Production Ready**: Proper static file serving and caching
4. **Scalable**: Easy to add more backend instances behind nginx
5. **Secure**: Backend not directly exposed to internet


