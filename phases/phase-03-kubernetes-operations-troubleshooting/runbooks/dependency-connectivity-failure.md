# Runbook: Redis Or Dependency Connectivity Failure

## Symptom

```text
The application responds, but dependency-backed routes fail, degrade, or return dependency errors.
```

## Expected Path

```text
Client -> Ingress/Service -> Ready Pod -> container -> Flask route -> Redis or PostgreSQL
```

## Investigation

Inspect the runtime configuration:

```bash
kubectl exec -n request-tracing-lab deploy/request-tracing-lab -- env | grep -E 'DATABASE_URL|REDIS_URL'
```

Check dependency DNS from inside the Pod:

```bash
kubectl exec -n request-tracing-lab deploy/request-tracing-lab -- python - <<'PYCODE'
import socket
for name in ["postgres", "redis"]:
    try:
        print(name, socket.gethostbyname(name))
    except Exception as exc:
        print(name, type(exc).__name__, exc)
PYCODE
```

Check application logs:

```bash
kubectl logs -n request-tracing-lab deploy/request-tracing-lab --tail=100
```

What to inspect:

```text
Dependency hostname:
Dependency port:
Environment variable value:
Service DNS resolution:
Application error category:
Whether the failing route requires PostgreSQL, Redis, or both:
```

## Common Causes

```text
Wrong dependency host in DATABASE_URL or REDIS_URL.
Dependency Service does not exist in the namespace.
Dependency Pod is not Ready.
Port mismatch between the dependency Service and container.
Database schema is missing even though the network connection works.
Redis is unavailable, causing cache miss fallback or cache errors.
```

## Fix Or Mitigation

```text
Correct the dependency URL.
Create or repair the dependency Service.
Start the dependency workload.
Apply the database schema if the connection works but queries fail.
Preserve PostgreSQL as source of truth; use Redis as temporary state only.
```

## Validation

```bash
kubectl logs -n request-tracing-lab deploy/request-tracing-lab --tail=100
kubectl port-forward -n request-tracing-lab svc/request-tracing-lab 8080:80
curl -i http://127.0.0.1:8080/health
```

For dependency-backed routes, validate with a route that actually touches PostgreSQL or Redis, such as `/notes` after the schema exists.
