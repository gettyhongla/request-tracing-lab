# Phase 2: Package the App into a Container

## Goal

Package the Flask app into a Docker image, run it as a container, and prove that the containerized app still handles requests correctly.

## Request Flow

```text
curl on laptop
  |
  v
127.0.0.1:5001 on host
  |
  v
Docker port mapping
  |
  v
5001 inside container
  |
  v
Flask app
  |
  v
/health
  |
  v
JSON response with X-Request-ID
```

## Step 1: Create the Dockerfile

Created:

```text
request-tracing-lab/
|-- Dockerfile
```

The `Dockerfile` is the image blueprint. It shows how the app becomes a runnable container image.

It covers:

```text
Python base image
Working directory
requirements.txt dependency install
app.py copy
container-friendly environment variables
non-root runtime user
port 5001
/health health check
python app.py startup command
```

## Step 2: Create the .dockerignore

Created:

```text
request-tracing-lab/
|-- .dockerignore
```

The `.dockerignore` prevents local-only files from being copied into the Docker build context.

Ignored files:

```gitignore
venv/
.venv/
__pycache__/
**/__pycache__/
*.py[cod]
.git/
.DS_Store
.env
*.pem
*.key
cookies.txt
```

## Step 3: Build the Image

Command:

```bash
docker build -t request-tracing-lab:local .
```

Build result:

```text
Successful
```

Build evidence:

```text
[+] Building 2.2s (11/11) FINISHED
load build definition from Dockerfile
load .dockerignore
load build context
CACHED [2/6] WORKDIR /app
CACHED [3/6] RUN addgroup --system app && adduser --system --ingroup app app
CACHED [4/6] COPY requirements.txt .
CACHED [5/6] RUN python -m pip install --no-cache-dir --upgrade pip && python -m pip install --no-cache-dir -r requirements.txt
CACHED [6/6] COPY app.py .
naming to docker.io/library/request-tracing-lab:local
```

Any warnings:

```text
No blocking warnings captured in this build output.
```

What this proves:

```text
Docker found the Dockerfile and .dockerignore, used the current directory as the build context, installed the app dependencies, copied app.py, and created the local image request-tracing-lab:local.
```

## Step 4: Inspect the Image

Command:

```bash
docker images request-tracing-lab
```

Output:

```text
IMAGE                       ID             DISK USAGE   CONTENT SIZE   EXTRA
request-tracing-lab:local   a2792a8e07b4   249MB        54.4MB         U
```

What this proves:

```text
The image exists locally with the expected name and tag.
```

## Step 5: Run the Container

Command:

```bash
docker run --rm \
  -p 5001:5001 \
  -e FLASK_RUN_HOST=0.0.0.0 \
  -e FLASK_RUN_PORT=5001 \
  -e FLASK_DEBUG=false \
  -e FLASK_SECRET_KEY=local-session-secret \
  -e JWT_SECRET=local-jwt-secret \
  request-tracing-lab:local
```

Port mapping:

```text
host port 5001 -> container port 5001
```

Why port `5001`:

```text
Port 5000 was already used by macOS, so the container test used 5001.
```

## Step 6: Test the Container

Command:

```bash
curl -i http://127.0.0.1:5001/health
```

Response headers:

```http
HTTP/1.1 200 OK
Server: Werkzeug/3.1.8 Python/3.12.13
Date: Fri, 24 Jul 2026 06:50:22 GMT
Content-Type: application/json
Content-Length: 68
X-Request-ID: d1dc6a86-e309-4000-8a86-9d7ddd0b5441
Connection: close
```

Response body:

```json
{
  "status": "healthy",
  "timestamp": "2026-07-24T06:50:22.500629+00:00"
}
```

What this proves:

```text
The request reached the Flask app running inside the container. The app returned a successful JSON response and included X-Request-ID, so request tracing still works after packaging.
```

## Evidence Summary

```text
Dockerfile created:
Yes

.dockerignore created:
Yes

Build command:
docker build -t request-tracing-lab:local .

Image name and tag:
request-tracing-lab:local

Image inspection command:
docker images request-tracing-lab

Image ID:
a2792a8e07b4

Disk usage:
249MB

Content size:
54.4MB

Run command:
docker run --rm -p 5001:5001 ... request-tracing-lab:local

Host port:
5001

Container port:
5001

curl command:
curl -i http://127.0.0.1:5001/health

Response status:
HTTP/1.1 200 OK

X-Request-ID:
d1dc6a86-e309-4000-8a86-9d7ddd0b5441
```

## Troubleshooting Prompts

What happens if the app binds to `127.0.0.1` inside the container?

```text
The app may only listen on the container's loopback interface.

Result:
The Flask process can answer requests from inside the container, but traffic forwarded from Docker or Kubernetes may not reach it.

Fix:
Bind the app to 0.0.0.0 inside the container.
```

What happens if the host port is mapped incorrectly?

```text
The container may be running correctly, but the laptop request goes to the wrong host port.

Example:
If the container is started with -p 5002:5001, then this will fail:
curl http://127.0.0.1:5001/health

The correct test would be:
curl http://127.0.0.1:5002/health
```

How do you inspect container logs?

```bash
docker ps
docker logs <container-id-or-name>
```

For this lab, the app writes logs to stdout/stderr, so `docker logs` should show the same Flask request logs that appeared when running `python app.py` locally.

How do you verify the container is listening on the expected port?

```bash
docker ps
docker port <container-id-or-name>
curl -i http://127.0.0.1:5001/health
```

What to prove:

```text
docker ps shows the port mapping.
docker port shows host port -> container port.
curl proves the mapped port reaches the Flask /health route.
```

How would you keep secrets out of the image?

```text
Do not hard-code secrets in app.py.
Do not put secrets in the Dockerfile.
Do not copy .env, keys, certificates, or cookies into the image.
Use runtime environment variables for local testing.
Use Kubernetes Secrets or a secret manager in Kubernetes-style environments.
```

## Key Takeaways

```text
Build context:
The dot in docker build -t request-tracing-lab:local . tells Docker to use the current directory as the build context.

Dockerfile:
The Dockerfile must exist in the build context unless another file is specified with -f.

.dockerignore:
.dockerignore keeps local-only files, caches, Git history, secrets, and generated files out of the build context.

Port mapping:
-p 5001:5001 maps laptop port 5001 to container port 5001.

Runtime config:
The container image is reusable because host, port, debug mode, and secrets are supplied at runtime with environment variables.

Tracing:
The same /health endpoint and X-Request-ID behavior worked after packaging, proving the request-tracing behavior survived the move into a container.
```
