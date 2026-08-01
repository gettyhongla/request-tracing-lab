# Lab 13: Container Foundation

Manually containerize one service so the Phase 3 platform work has a solid foundation.

## Why This Lab Exists

Phase 3 is where Docker Compose and Kubernetes become the main subject. This lab only introduces the container basics needed to understand what will be operated later.

## Architecture Before

```text
Flask runs directly on your machine.
PostgreSQL, Redis, and NGINX may also run locally.
```

## Architecture After

```text
Flask API image
  |
  v
Flask API container
  |
  v
Runtime environment variables
```

NGINX, PostgreSQL, Redis, workers, and Compose preparation can be documented here, but the complete multi-container platform belongs in Phase 3.

## Key Terms

| Term | Meaning |
| --- | --- |
| Image | Packaged filesystem and startup command |
| Container | Running instance of an image |
| Dockerfile | Instructions for building an image |
| Base image | Starting image, such as Python slim |
| Layer | Cached filesystem change in an image |
| Build context | Files sent to Docker during build |
| `.dockerignore` | File that keeps unwanted files out of context |
| `COPY` | Add files into the image |
| `RUN` | Execute build-time command |
| `CMD` | Default runtime command |
| Non-root user | Safer runtime user inside the container |

## Must Implement Or Inspect

1. Inspect [Dockerfile](../../../Dockerfile).
2. Explain image versus container.
3. Identify the base image.
4. Identify dependency installation.
5. Identify which files are copied.
6. Identify the listening port.
7. Confirm logs go to stdout/stderr.
8. Confirm the container does not require secrets baked into the image.
9. Document required environment variables.
10. Note what Phase 3 will add with Compose and Kubernetes.

## Optional Codex-Assisted Improvements

Codex may help with:

```text
Improving the Dockerfile:
Adding an NGINX image/config:
Preparing PostgreSQL, Redis, and worker services for later Compose:
Documenting environment variables:
Documenting persistent data:
```

Do not build the complete Docker Compose or Kubernetes platform in this lab.

## Healthy-Path Verification

Capture:

```text
Build command:
Image tag:
Run command:
Port mapping:
Health endpoint response:
Container logs:
Environment variables:
```

## Controlled Failures

Test:

```text
Missing environment variable:
Wrong port mapping:
Missing dependency:
Container starts but app cannot reach PostgreSQL:
Health check failure:
```

## Evidence To Capture

```text
Dockerfile path:
Base image:
Build context:
Dependencies:
Runtime command:
Listening port:
Non-root user:
Health check:
Logs:
Failure symptom:
Interview explanation:
Retained takeaway:
```

## Troubleshooting Questions

```text
Did the image build?
Did the container start?
Is the app listening inside the container?
Is the host port mapped correctly?
Are secrets injected at runtime instead of baked into the image?
What data would disappear if the container were deleted?
```

## Interview Explanation

```text
A Docker image packages the Flask API and dependencies. A container runs that image with runtime configuration. The image should not contain secrets, should run as a non-root user, should log to stdout/stderr, and should expose health behavior. Full multi-service orchestration is saved for Phase 3.
```

## Completion Standard

```text
The learner can explain each Dockerfile line and run the Flask API container without turning Phase 2 into a full orchestration lab.
```

## Retained Takeaway

```text
Containers package the service; orchestration operates the service. Learn the package before the platform.
```
