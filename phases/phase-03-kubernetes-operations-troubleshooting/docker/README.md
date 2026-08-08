# Docker Assets

This directory supports Phase 3 Labs 01-04.

## Files

| File | Purpose |
| --- | --- |
| [nginx.conf](nginx.conf) | Reverse proxy config for the Docker Compose request path. |
| [init/002_request_notes.sql](init/002_request_notes.sql) | Small schema initializer for the `/notes` route used by the app. |

The root [Dockerfile](../../../Dockerfile) and root [.dockerignore](../../../.dockerignore) remain the source for image-build exercises.

## Compose Request Path

```text
Client -> host port 8080 -> NGINX container -> api:5001 -> Flask -> PostgreSQL/Redis
```

Use the Compose file from the Phase 3 directory:

```bash
cd phases/phase-03-kubernetes-operations-troubleshooting
docker compose up --build
```

Useful checks:

```bash
docker compose ps
docker compose logs nginx
docker compose logs api
docker compose exec api env | grep -E 'DATABASE_URL|REDIS_URL|FLASK_RUN_PORT'
docker compose exec api python -c "import socket; print(socket.gethostbyname('postgres')); print(socket.gethostbyname('redis'))"
curl -i http://127.0.0.1:8080/health
```
