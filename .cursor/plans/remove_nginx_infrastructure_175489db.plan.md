---
name: Remove Nginx Infrastructure
overview: Remove nginx reverse proxy from the Docker infrastructure and expose frontend/backend services directly with proper environment configuration.
todos:
  - id: update-docker-compose
    content: "Update docker-compose.yml: remove nginx, expose frontend/backend ports"
    status: completed
  - id: delete-nginx-conf
    content: Delete nginx.conf file
    status: completed
---

# Remove Nginx from Infrastructure

## Changes Overview

The current setup uses nginx as a reverse proxy (port 8866) that routes traffic to frontend (port 3000) and backend (port 8000). We'll remove nginx and expose services directly.

## Files to Modify

### 1. Update [infrastructure/docker-compose.yml](infrastructure/docker-compose.yml)

**Remove:**

- The entire `nginx` service block (lines 56-69)

**Modify:**

- **Backend service:** Add `ports: - "8000:8000"` to expose the API directly
- **Frontend service:** Add `ports: - "8866:3000"` to maintain the same external port and add `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1` environment variable

**Result:**

- Frontend accessible at `http://localhost:8866`
- Backend API accessible at `http://localhost:8000`
- Swagger docs at `http://localhost:8000/docs`

### 2. Delete [infrastructure/nginx.conf](infrastructure/nginx.conf)

No longer needed since we're removing the nginx reverse proxy.

## Updated docker-compose.yml Structure

```yaml
services:
  postgres:
    # ... unchanged ...
    
  backend:
    # ... existing config ...
    ports:
      - "8000:8000"  # NEW: expose directly
    
  frontend:
    # ... existing config ...
    ports:
      - "8866:3000"  # NEW: expose directly (same external port as before)
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1  # NEW: point to backend
    
  pgadmin:
    # ... unchanged ...
```

## Notes

- The README already documents backend at `http://localhost:8000` and overall access at `http://localhost:8866`, which will remain accurate
- CORS is already configured in the backend to allow requests from `localhost:8866`