# Production Systems Lab

A hands-on curriculum for learning how production systems are built, operated, troubleshot, and explained from evidence.

The application is the practice environment. The lesson is how to follow a request through the system, prove what happened, and explain the result clearly during support, DevOps, customer engineering, or cloud operations work.

## Who This Is For

This project is for learners who want to build practical production-system judgment without turning the repo into an advanced backend-development course.

It is especially useful for:

- Cloud Operations
- Technical Support Engineering
- Customer Engineering
- DevOps
- Site Reliability foundations
- Production-readiness communication and evidence-based troubleshooting

## Philosophy

Every production incident starts with a request. Every request travels through multiple systems. Every system leaves evidence.

Use the repo in this order:

```text
Start at root README
    ↓
Open the current phase README
    ↓
Work through that phase LABS.md
    ↓
Record evidence in AnswersByGetty/phase-XX.md
    ↓
Continue to the next phase
```

## High-Level Architecture

```text
Browser or curl
  |
  v
NGINX
  |
  v
Flask support-ticket API
  |-- PostgreSQL  # durable users, tickets, messages, audit events
  |-- Redis       # temporary sessions, cache, queue data
  |-- Worker      # asynchronous notification or diagnostic jobs
  |-- Webhooks    # outbound events to other systems
  `-- WebSocket/SSE/polling path for live ticket updates
```

Phase 2 studies the boundaries in this path: client to proxy, proxy to upstream, API to Redis, API to PostgreSQL, and API to optional async/outbound components.

Phase 3 packages and operates the same request path with Docker, Kubernetes, Helm, rollout safety, runbooks, and evidence-first troubleshooting.

## Phases

| Phase | Start Here | Labs | Answers |
| --- | --- | --- | --- |
| Phase 1: Understand and trace a request | [README](phases/phase-01-understanding-a-request/README.md) | [LABS](phases/phase-01-understanding-a-request/LABS.md) | [phase-01.md](AnswersByGetty/phase-01.md) |
| Phase 2: Tracing service boundaries | [README](phases/phase-02-tracing-service-boundaries/README.md) | [LABS](phases/phase-02-tracing-service-boundaries/LABS.md) | [phase-02.md](AnswersByGetty/phase-02.md) |
| Phase 3: Kubernetes operations and troubleshooting | [README](phases/phase-03-kubernetes-operations-troubleshooting/README.md) | [LABS](phases/phase-03-kubernetes-operations-troubleshooting/LABS.md) | [phase-03.md](AnswersByGetty/phase-03.md) |

## Repository Structure

```text
request-tracing-lab/
|-- README.md
|-- app.py
|-- requirements.txt
|-- Dockerfile
|-- phases/
|   |-- phase-01-understanding-a-request/
|   |   |-- README.md
|   |   `-- LABS.md
|   |-- phase-02-tracing-service-boundaries/
|   |   |-- README.md
|   |   |-- LABS.md
|   |   |-- sql/
|   |   |-- architecture/
|   |   `-- challenges/
|   `-- phase-03-kubernetes-operations-troubleshooting/
|       |-- README.md
|       |-- LABS.md
|       |-- docker/
|       |-- kubernetes/
|       |-- helm/
|       |-- architecture/
|       |-- challenges/
|       |-- worksheets/
|       `-- runbooks/
|-- AnswersByGetty/
|   |-- phase-01.md
|   |-- phase-02.md
|   `-- phase-03.md
`-- tests/
```

## How To Run The Current Application

Create a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

Start the app:

```bash
python app.py
```

Open:

```text
http://127.0.0.1:5000
```

The default Phase 1 lab credentials are:

```text
username: getty
password: cloud
```

## Answers By Getty

The `phases/` directory contains reusable curriculum. `AnswersByGetty/` contains completed evidence, commands, conclusions, and retained takeaways from actual work.

Do not invent answers. Add evidence only after doing the lab work.
