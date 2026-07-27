# Lab 01: Production Readiness Review

## Scenario

Assume the application has:

```text
React frontend
Node or Python backend services
PostgreSQL
Redis
Queueing
Worker service
```

Management wants it in production next week.

## Goal

Decide what evidence is required before saying the system is safe to deploy.

This lab should slow down the deadline and turn vague confidence into concrete proof across architecture, deployment, security, data, observability, testing, rollback, and ownership.

## Required Evidence

Capture evidence for:

* Architecture diagram and request flows
* CI/CD pipeline with repeatable builds
* Container image review and vulnerability scanning
* Environment-specific configuration
* Secrets in a secret manager, not in code or images
* Health and readiness checks
* Database migrations tested and rollback understood
* Redis cache, session, or queue responsibility defined
* Queue retry, idempotency, and dead-letter behavior defined
* Unit, integration, smoke, and load tests
* Logs, metrics, traces, dashboards, and alerts
* SLOs or launch health thresholds
* Runbooks and on-call ownership
* Rollback or roll-forward plan

## Launch Blockers

Treat these as blockers:

```text
No rollback plan.
No production secrets strategy.
No health/readiness checks.
No database migration plan.
No observability for critical paths.
No load test or capacity estimate.
No owner for deploy and incident response.
```

## Deliverable

Write the completed review in:

```text
AnswersByGetty/phase-08-scale-reliability-design/lab-01-production-readiness-review.md
```

Use this shape:

```text
Architecture:
Request flows:
Production readiness evidence:
Known gaps:
Launch blockers:
Go/no-go decision:
Retained takeaway:
```

## Completion Standard

You can explain what evidence is required before production, what risks remain, and what would block the launch.
