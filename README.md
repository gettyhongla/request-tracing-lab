# Production Systems Lab

A hands-on engineering curriculum for learning how modern production systems are designed, built, operated, troubleshot, and explained.

Every production incident starts with a request.
Every request travels through multiple systems.
Every system leaves evidence.
This repository teaches you how to follow that evidence.

## Philosophy

The app is not the whole lesson. The app is the thing we use to practice production engineering.

Each phase adds a larger production concern:

```text
Follow one request.
Build the service behind that request.
Operate the service safely.
Review production scenarios from evidence.
```

The goal is to answer production questions clearly:

```text
What is the user trying to do?
Where does the request enter the system?
Which components and dependencies does it touch?
What does healthy behavior look like?
What evidence proves each layer worked?
Where did the request slow down or fail?
What should be mitigated first?
How do we explain the root cause clearly?
How do we prevent the same failure next time?
```

## Project Roadmap

The `main` branch contains the active public build path. Future work should be added only when the lab instructions or completed evidence are ready to publish.

| Phase | Focus | Outcome |
| --- | --- | --- |
| [Phase 1](phases/phase-01-understanding-a-request/) | Understanding a request | Understand HTTP, auth, cookies, JWTs, request IDs, logs, latency, and controlled failures |
| [Phase 2](phases/phase-02-building-a-production-service/) | Building a production service | Build the service path: NGINX, Flask API, PostgreSQL, Redis cache/session support, health/readiness, observability, k6 load testing, and readiness review |
| [Phase 3](phases/phase-03-operating-a-production-service/) | Operating a production service | Containerize, configure, observe, alert, verify deployments, roll back safely, migrate to Kubernetes, reason about workers/queues, and write incident notes |
| [Production reviews](production-reviews/) | Interview-style production scenarios | Practice launch reviews, slow-login investigations, database latency, `502` failures, and resource sizing |

## Evidence Model

Every lab should produce evidence, not just notes:

```text
Customer symptom:
Request path:
Expected healthy behavior:
Observed behavior:
Client evidence:
Network or edge evidence:
Infrastructure evidence:
Application evidence:
Dependency evidence:
Metrics, logs, or traces:
Hypotheses considered:
Evidence that ruled causes out:
Root cause or design conclusion:
Mitigation:
Prevention:
Customer explanation:
Engineering follow-up:
Retained takeaway:
```

Successful paths should read like trace reports. Broken paths should read like RCA reports. Design-heavy labs should read like short production reviews.

## Repository Structure

```text
request-tracing-lab/
|-- app.py
|-- requirements.txt
|-- Dockerfile
|-- phases/
|   |-- phase-01-understanding-a-request/
|   |-- phase-02-building-a-production-service/
|   `-- phase-03-operating-a-production-service/
|-- AnswersByGetty/
|   |-- phase-01-understanding-a-request/
|   |-- phase-02-building-a-production-service/
|   `-- phase-03-operating-a-production-service/
`-- production-reviews/
```

## Phase Structure

```text
phases/phase-01-understanding-a-request/
|-- README.md
`-- labs/
    |-- 01-establish-baseline/
    |-- 02-inspect-request-devtools/
    |-- 03-correlate-request-server-logs/
    |-- 04-compare-get-and-post/
    |-- 05-trace-session-authentication/
    |-- 06-trace-jwt-authentication/
    |-- 07-diagnose-failure-responses/
    `-- 08-inspect-latency-and-tls/

phases/phase-02-building-a-production-service/
|-- README.md
|-- labs/
|   |-- 01-three-tier-architecture.md
|   |-- 02-nginx-reverse-proxy.md
|   |-- 03-postgresql-persistence.md
|   |-- 04-redis-cache-and-session-support.md
|   |-- 05-support-ticket-data-model.md
|   |-- 06-health-and-readiness-endpoints.md
|   |-- 07-request-ids-logs-latency.md
|   |-- 08-basic-observability.md
|   |-- 09-k6-load-testing.md
|   `-- 10-production-readiness-review.md
|-- assets/
|-- configs/
`-- manifests/

phases/phase-03-operating-a-production-service/
|-- README.md
|-- labs/
|   |-- 01-containerize-the-system.md
|   |-- 02-configuration-and-secrets.md
|   |-- 03-observability.md
|   |-- 04-alerting-and-supportability.md
|   |-- 05-deployment-verification.md
|   |-- 06-rollback-and-release-safety.md
|   |-- 07-kubernetes-migration.md
|   `-- 08-production-incident.md
|-- docker/
|-- kubernetes/
|-- observability/
`-- runbooks/
```

## Answers By Getty

The `phases/` folders teach the labs. `AnswersByGetty/` captures one engineer's completed evidence, conclusions, and retained takeaways.

Phase 2 answers should be added only after the Phase 2 labs are completed. When added, completed Phase 2 and Phase 3 work should mirror the lab filenames:

```text
AnswersByGetty/phase-02-building-a-production-service/labs/
AnswersByGetty/phase-03-operating-a-production-service/labs/
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

Start with the request path before adding tools:

```text
What request was sent?
What response came back?
Which request ID ties client and server evidence together?
Where did authentication state appear?
Where did the request go next?
Where did a failed request stop?
What evidence proves that conclusion?
```

Each later phase adds one architectural layer, one operational concern, and one new class of failure. The end goal is to design, build, operate, troubleshoot, and explain production systems clearly to both customers and engineering teams.
