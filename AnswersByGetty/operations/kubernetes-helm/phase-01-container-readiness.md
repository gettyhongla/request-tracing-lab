# Phase 1: Prepare the App for Containers

## Goal

Confirm the Flask app can run locally with container-style runtime settings before building a Docker image.

This phase proves:

```text
The app starts successfully.
The app can read environment variables.
The app can listen on 0.0.0.0.
The health endpoint still works.
Logs still print to the terminal.
X-Request-ID still appears in responses and logs.
```

## Why This Phase Matters

Before building an image, the app should already behave the way it needs to behave inside a container.

Container runtime behavior means:

```text
The app starts from a runtime command.
Settings come from environment variables.
Secrets are injected at runtime.
The app listens on an address reachable inside its network environment.
Logs go to stdout/stderr.
```

If this fails locally, Docker and Kubernetes will add more layers to troubleshoot.

## Request Flow

```text
curl on laptop
  |
  v
127.0.0.1:5001
  |
  v
Flask process listening on 0.0.0.0:5001
  |
  v
/health
  |
  v
JSON response with X-Request-ID
```

## Step 1: Run With Local Defaults

Command:

```bash
python app.py
```

Test:

```bash
curl -i http://127.0.0.1:5000/health
```

Expected result:

```text
HTTP status is 200.
Response body says the app is healthy.
Response headers include X-Request-ID.
Flask logs show request_started and request_finished.
```

## Step 2: Run With Container-Style Runtime Settings

Port `5000` was already in use on this machine, so the app was started on port `5001`.

Command:

```bash
FLASK_RUN_HOST=0.0.0.0 \
FLASK_RUN_PORT=5001 \
FLASK_DEBUG=false \
FLASK_SECRET_KEY=local-session-secret \
JWT_SECRET=local-jwt-secret \
python3 app.py
```

Startup evidence:

```text
Serving Flask app 'app'
Debug mode: off
Running on all addresses (0.0.0.0)
Running on http://127.0.0.1:5001
Running on http://10.0.0.11:5001
```

What this proves:

```text
The app accepted runtime configuration from environment variables and listened on 0.0.0.0 instead of only 127.0.0.1.
```

## Step 3: Test The Health Endpoint

Command:

```bash
curl -i http://127.0.0.1:5001/health
```

Response headers:

```http
HTTP/1.1 200 OK
Server: Werkzeug/3.1.8 Python/3.9.6
Date: Fri, 24 Jul 2026 05:39:37 GMT
Content-Type: application/json
Content-Length: 68
X-Request-ID: e4d2e8f2-bb24-4890-a09c-a3f3b521e909
Connection: close
```

Response body:

```json
{
  "status": "healthy",
  "timestamp": "2026-07-24T05:39:37.201534+00:00"
}
```

Matching Flask logs:

```text
2026-07-24 01:39:37,201 INFO request_started request_id=e4d2e8f2-bb24-4890-a09c-a3f3b521e909 method=GET path=/health remote_ip=127.0.0.1 user_agent=curl/8.7.1
2026-07-24 01:39:37,202 INFO request_finished request_id=e4d2e8f2-bb24-4890-a09c-a3f3b521e909 status=200
```

What this proves:

```text
The Flask app responded successfully with runtime env vars, returned X-Request-ID, and logged the same request ID with method, path, and status.
```

## Step 4: Troubleshoot Port 5000

Original symptom:

```text
Port 5000 was already in use.
```

Command:

```bash
lsof -i :5000
```

Evidence:

```text
ControlCe was listening on *:commplex-main, which maps to port 5000.
```

Conclusion:

```text
The startup failure was not caused by Flask code. Port 5000 was already owned by a macOS system process, so I used FLASK_RUN_PORT=5001.
```

Why this matters:

```text
Port conflicts are common operations problems. In Docker or Kubernetes, a similar symptom can come from the wrong container port, wrong service targetPort, or another process already listening on the expected port.
```

## Runtime Settings

```text
FLASK_RUN_HOST: Controls which network address Flask listens on.
FLASK_RUN_PORT: Controls which port Flask listens on.
FLASK_DEBUG: Controls debug behavior. Use false outside local development.
FLASK_SECRET_KEY: Signs Flask session cookies. Use a real secret in production.
JWT_SECRET: Signs JWTs. Use a real secret in production.
```

## Key Takeaways

```text
Network namespace:
A container has its own network environment. Its localhost is not the same thing as the laptop's localhost.

Loopback:
127.0.0.1 means "this same network environment." On a laptop, it means the laptop. Inside a container, it means the container.

Binding:
Binding to 0.0.0.0 does not create a network namespace. It tells the app to listen on all available interfaces inside the current network environment.

Container traffic:
Traffic from outside the container needs the app to listen on an address reachable from the container network interface.

Runtime config:
Environment variables let the same code run in different environments without editing source code.

Reusability:
The image should contain the app, not environment-specific settings or secrets.

Debug mode:
FLASK_DEBUG=false is safer outside local development because detailed errors should go to logs and monitoring, not directly to users.

Port troubleshooting:
When the app cannot start, check whether the expected port is already in use before assuming the application code is broken.
```
