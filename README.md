# Production Systems Lab

A hands-on production systems portfolio for system design, request flow, production deployment, production failures, observability, root cause analysis, and incident communication.

This project starts with a small Flask application, but the app is only the first layer. The system grows over time to demonstrate how an application is designed, deployed, operated, stressed, investigated, and explained when customers report vague symptoms like slow login, intermittent errors, failed reports, or missing data.

## Core Skill

For every architecture, the evidence workflow is the same:

```text
Draw the system.
Trace the request path.
Identify each dependency.
Define healthy behavior.
Package the application.
Configure the runtime.
Deploy a release.
Verify the deployment.
Inject a realistic failure.
Collect evidence.
Find the failed layer.
Mitigate the issue.
Roll back or roll forward safely.
Explain the root cause.
Write the postmortem.
```

The focus is architectural reasoning backed by working evidence.

## Project Roadmap

| Phase | Focus | Outcome |
| --- | --- | --- |
| [Phase 1](phases/phase-01-single-service-request-tracing/) | Single-service request tracing | Understand HTTP, auth, request IDs, logs, latency, and controlled failures |
| [Phase 2](phases/phase-02-three-tier-application/) | Three-tier application design | Trace traffic through browser, reverse proxy, Flask API, PostgreSQL, and Redis; explain database readiness, query behavior, and data failure modes |
| [Phase 3](phases/phase-03-production-deployment-foundation/) | Production deployment foundation | Package, configure, route, load balance, deploy, verify, roll back, and troubleshoot the app in containerized/Kubernetes-style environments |
| [Phase 4](phases/phase-04-observability/) | Observability | Connect logs, metrics, traces, dashboards, and alerts with request behavior |
| [Phase 5](phases/phase-05-queues-workers/) | Queues and workers | Investigate asynchronous jobs, retries, backlogs, idempotency, and eventual consistency |
| [Phase 6](phases/phase-06-distributed-services/) | Distributed services | Reason through service boundaries, failed hops, timeouts, retries, and partial failure |
| [Phase 7](phases/phase-07-production-operations/) | Production operations | Produce release checks, incident response notes, customer updates, engineering escalations, runbooks, and postmortems |
| [Phase 8](phases/phase-08-scale-reliability-design/) | Production architecture and reliability | Design AWS production architecture, global availability, capacity, safe deployments, graceful degradation, rollback strategy, and SLO tradeoffs |
| [Phase 9](phases/phase-09-scenario-diagnostics/) | Scenario diagnostics | Diagnose unknown production scenarios with structured, evidence-first reasoning |

## Current Architecture

Phase 1 starts here:

```text
Browser or curl
      |
      v
Flask application
      |
      v
Application logs
```

The current app lets you inspect:

* HTTP methods, headers, bodies, and status codes
* Session cookies
* JWT authentication
* `X-Request-ID` correlation
* Slow requests
* Application errors
* Local HTTPS behavior

## Target Phase 2 Architecture

Phase 2 expands the same app into a three-tier system:

```text
Browser
   |
   v
NGINX reverse proxy
   |
   v
Flask API
   |
   v
PostgreSQL
```

Then Redis is added for one clear responsibility, such as caching or sessions:

```text
Flask API
   |-- PostgreSQL
   `-- Redis
```

![Three-tier architecture request flow](phases/phase-02-three-tier-application/assets/three-tier-request-flow.png)

## Repository Structure

```text
request-tracing-lab/
|
|-- app.py
|-- requirements.txt
|-- Dockerfile
|-- phases/
|   |-- phase-01-single-service-request-tracing/
|   |-- phase-02-three-tier-application/
|   |-- phase-03-production-deployment-foundation/
|   |-- phase-04-observability/
|   |-- phase-05-queues-workers/
|   |-- phase-06-distributed-services/
|   |-- phase-07-production-operations/
|   |-- phase-08-scale-reliability-design/
|   `-- phase-09-scenario-diagnostics/
|
`-- AnswersByGetty/
```

Use `AnswersByGetty/` for completed evidence, conclusions, and retained takeaways.

## What Goes Where

```text
phases/
Prompts, diagrams, lab objectives, completion standards, manifests, and reusable project material.

phases/*/solutions/
Short answer guides that show what good reasoning should include.

AnswersByGetty/
Getty's actual work: evidence collected, commands run, observations, troubleshooting conclusions, reflections, and takeaways.
```

The project should teach others while also showing how production problems are investigated, designed around, deployed, and communicated. Keep the public docs focused; let the answer files prove the work.

## Production Deployment Skills

This lab should build the skills needed to move a service toward production, not just draw diagrams.

This project demonstrates:

* Building a repeatable application package
* Separating code, configuration, and secrets
* Defining health, readiness, and rollback signals
* Deploying the same system across local and production-like environments
* Verifying a release with logs, metrics, traces, and user-facing checks
* Debugging failed deploys, bad configuration, broken routing, and dependency failures
* Writing runbooks for normal operations and incident response
* Explaining deployment risk and customer impact clearly

Production readiness means you can answer:

```text
What changed?
How was it deployed?
How do we know it is healthy?
How do we know customers are not impacted?
How do we roll back safely?
What evidence would prove the deployment caused or did not cause the issue?
```

For larger production-design reviews, you should also be able to answer:

```text
What architecture would you deploy on AWS?
Which traffic is public and which traffic is private?
Where does authentication happen?
How is the system globally available?
How are containers secured?
How are database, Redis, and queue dependencies protected?
How do you test, load test, monitor, and roll back before management calls it production-ready?
```

## Install And Run

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

The default lab credentials are:

```text
username: getty
password: cloud
```

## How To Work Through The Lab

Phase 1 establishes the request path between a browser request, Flask, and the server logs.

Phase 2 begins after the single-service request path is clear:

```text
What request was sent?
What response came back?
Which request ID ties client and server evidence together?
Where did authentication state appear?
Where did a failed request stop?
What evidence proves that conclusion?
```

Each later phase should add one architectural layer, one deployment concern, and one new class of failure. The end goal is to design, deploy, operate, and explain production systems clearly to both customers and engineering teams.
