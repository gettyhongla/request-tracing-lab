# Phase 1: Prepare the App for Containers

## Goal

Prepare the Flask application so it can run locally first, then run correctly inside a container later.

In this phase, you will confirms:

```text
The app still runs with local defaults.
The app can read configuration from environment variables.
The app can bind to a container-friendly network address.
The health endpoint works before packaging the app into an image.
The request ID still appears in responses and logs.
```

## Why This Phase Matters

Before building a Docker image, confirm that the application can run in the same style it will run later inside a container. ***Container runtime behavior*** means the app will start from a container image and receive its runtime settings from the environment around it.
In practice, you confirm these things before building the image:

```text
The app starts successfully.
The app can read env vars.
The app can listen on 0.0.0.0.
The health endpoint still works.
Logs still go to the terminal.
Request IDs still appear in responses and logs.
```

Changing the ***container runtime environment*** means changing how the app is started and configured without editing the app code. For example, instead of hard-coding the host, port, debug mode, or secrets, the runtime environment provides those values. If the app cannot run correctly with environment variables and a container-friendly host binding, the Docker or Kubernetes deployment can fail later even if the image builds successfully.

## Request Flow Before Containers

When the Flask app runs directly on the laptop:

```text
Browser or curl
  |
  v
127.0.0.1:5000
  |
  v
Flask process on the laptop
  |
  v
/health route
  |
  v
Response with X-Request-ID
```

## Request Flow To Prepare For Containers

When the app later runs inside a container:

```text
Browser or curl on host
  |
  v
Host port
  |
  v
Container port
  |
  v
Flask process inside container
  |
  v
/health route
  |
  v
Response with X-Request-ID
```

The important change is that the Flask process will not be running directly in the host network environment. The app must listen on an address reachable from the container network interface.

## Step 1: Run With Local Defaults

Start the app:

```bash
python app.py
```

Test the health endpoint from another terminal:

```bash
curl -i http://127.0.0.1:5000/health
```

Expected result:

```text
HTTP status is 200.
Response body says the app is healthy.
Response headers include X-Request-ID.
The Flask log shows request_started and request_finished for /health.
```

This proves the app works before changing the runtime environment.

## Step 2: Run With a Container-Friendly Host Binding

Stop the app, then run:

```bash
FLASK_RUN_HOST=0.0.0.0 python app.py
```

Test again:

```bash
curl -i http://127.0.0.1:5000/health
```

Expected result:

```text
HTTP status is still 200.
The app still returns JSON.
X-Request-ID still appears in the response.
The request still appears in Flask logs.
```

This proves the app can listen on all interfaces, which is required when traffic is forwarded into a container.

## Step 3: Run With Explicit Runtime Configuration

Run the app with the main runtime settings defined as environment variables:

```bash
FLASK_RUN_HOST=0.0.0.0 \
FLASK_RUN_PORT=5000 \
FLASK_DEBUG=false \
FLASK_SECRET_KEY=local-session-secret \
JWT_SECRET=local-jwt-secret \
python app.py
```

If port `5000` is already in use, choose another port:

```bash
FLASK_RUN_HOST=0.0.0.0 \
FLASK_RUN_PORT=5001 \
FLASK_DEBUG=false \
FLASK_SECRET_KEY=local-session-secret \
JWT_SECRET=local-jwt-secret \
python app.py
```

Test again:

```bash
curl -i http://127.0.0.1:5000/health
```

If using port `5001`, test:

```bash
curl -i http://127.0.0.1:5001/health
```

Expected result:

```text
HTTP status is 200.
The app still responds from /health.
Request IDs still work.
Flask logs still show request method, path, request ID, and status.
```

This proves the app can receive configuration from the environment instead of requiring code changes for every runtime.

## Runtime Settings

```text
FLASK_RUN_HOST: Controls which network address the Flask process listens on.
FLASK_RUN_PORT: Controls which port the Flask process listens on.
FLASK_DEBUG: Controls debug behavior. Use false outside local development.
FLASK_SECRET_KEY: Signs Flask session cookies. This should be a real secret in production.
JWT_SECRET: Signs JWTs. This should be a real secret in production.
```

## Evidence Captured
Captured evidence before moving to Docker:

```text
Command used to start the app:
FLASK_RUN_HOST=0.0.0.0 \
FLASK_RUN_PORT=5001 \
FLASK_DEBUG=false \
FLASK_SECRET_KEY=local-session-secret \
JWT_SECRET=local-jwt-secret \
python3 app.py

curl command used:
curl -i http://127.0.0.1:5001/health

Response status:
HTTP/1.1 200 OK

Response body:
{"status":"healthy","timestamp":"2026-07-24T05:39:37.201534+00:00"}

X-Request-ID response header:
X-Request-ID: e4d2e8f2-bb24-4890-a09c-a3f3b521e909

Matching Flask request_started log:
2026-07-24 01:39:37,201 INFO request_started request_id=e4d2e8f2-bb24-4890-a09c-a3f3b521e909 method=GET path=/health remote_ip=127.0.0.1 user_agent=curl/8.7.1

Matching Flask request_finished log:
2026-07-24 01:39:37,202 INFO request_finished request_id=e4d2e8f2-bb24-4890-a09c-a3f3b521e909 status=200

What this proves:
The Flask app can run with runtime configuration from environment variables, bind to 0.0.0.0, respond successfully on /health, include X-Request-ID in the response, and log the same request ID with method, path, and status.
```

Additional server startup evidence:

```text
Serving Flask app 'app'
Debug mode: off
Running on all addresses (0.0.0.0)
Running on http://127.0.0.1:5001
Running on http://10.0.0.11:5001
```

Port troubleshooting evidence:

```text
Original symptom:
Port 5000 was already in use.

Command used:
lsof -i :5000

Evidence:
ControlCe was listening on *:commplex-main, which maps to port 5000.

Conclusion:
The app failure was not caused by Flask code. Port 5000 was already owned by a macOS system process, so I used FLASK_RUN_PORT=5001.
```

port conflicts are common deployment problems. In containers and Kubernetes, the equivalent issue may appear as a wrong container port, wrong service `targetPort`, or another process already listening where the app expects to bind. running a simple lsof -i :5000 listed nwhat services are listening on port 5000

## Key Concepts

### Network Namespace

A network namespace is an isolated network environment. It has its own view of:

```text
Network interfaces
IP addresses
Ports
Routing table
localhost
```
`127.0.0.1` is the loopback address. Loopback means "this same network environment." On a laptop, `127.0.0.1` means the laptop's own loopback interface. Inside a container, `127.0.0.1` means the container's own loopback interface.

That difference matters because traffic from the host, Docker, or Kubernetes usually enters through the container's network interface, not through the container's loopback-only address.



FLASK_RUN_HOST:
```

Later, when Docker publishes a port, traffic can move like this:

```text
Laptop / host port
  |
  v
Container network interface
  |
  v
App listening on 0.0.0.0 inside the container
```

### Why Containers Use Isolation

Containers isolate application processes so one app can run with its own filesystem, dependencies, environment variables, and network view. In Kubernetes, this isolation helps each Pod run predictably:

```text
The container has its own process environment.
The Pod has its own IP address.
The app receives configuration through env vars, Secrets, and ConfigMaps.
Kubernetes can start, stop, restart, and replace Pods without changing the app code.
```

### Why Bind To `0.0.0.0`
Binding to `0.0.0.0` tells the app to listen on all available network interfaces in its current environment.For containers, this matters because traffic sent to the container port needs to reach the Flask process from outside the process itself.

### Runtime Config From Environment Variables
Reading runtime config from environment variables means the same code can run in different environments without editing the source code.

Example:

```text
Local:
FLASK_DEBUG=true
FLASK_RUN_HOST=127.0.0.1

Container or Kubernetes:
FLASK_DEBUG=false
FLASK_RUN_HOST=0.0.0.0
```

This pattern keeps the container image reusable. The image contains the application code, while the runtime environment provides settings.

`FLASK_DEBUG=false` is important outside local development because debug mode can expose detailed error pages, extra runtime behavior, and sensitive implementation details. In production-style environments, errors should go to logs and monitoring tools instead of being shown directly to users.

### Why Secrets Should Not Be Baked Into Images

Secrets should not be stored inside the Docker image because images are copied, cached, pushed to registries, scanned, and reused.

If a secret is baked into an image:

```text
Anyone with access to the image may access the secret.
Rotating the secret requires rebuilding the image.
The same secret may accidentally spread across local, staging, and production.
```

In Kubernetes, secrets should come from runtime configuration, usually through Kubernetes Secrets or a dedicated secret manager.

## What I Learned

```text
Network namespace:
A container has its own network environment. Its localhost is not the same thing as the laptop's localhost.

Loopback address:
127.0.0.1 means "this same network environment." On my laptop it means my laptop. Inside a container it means the container.

Binding:
I do not create a network namespace by binding to 0.0.0.0. Instead, 0.0.0.0 lets the app listen on all available interfaces in the current environment.

Container traffic:
For traffic outside the container to reach the app, the app needs to listen on an address reachable from the container network interface.

Runtime config:
Reading config from environment variables means the same code and image can run in different environments without changing the source code.

Reusability:
The container image should contain the app, not environment-specific settings or secrets. Local, staging, and production can inject different runtime values.

```
