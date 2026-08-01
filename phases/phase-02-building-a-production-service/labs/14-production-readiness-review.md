# Lab 14: Production-Readiness Review

Review whether the Phase 2 support-ticket application is ready to move into containerized operations.

## Why This Lab Exists

This lab pulls the Phase 2 learning together: support-ticket behavior, database durability, Redis temporary state, API boundaries, webhooks, queues, real-time updates, health/readiness, observability, basic load testing, and failure evidence.

It maps directly to interview prompts like:

```text
Management wants this app in production next week. What do you need before saying yes?
```

## Architecture Before

```text
Browser -> NGINX -> Flask support-ticket API
  |-- PostgreSQL
  |-- Redis
  |-- worker/queue path
  |-- webhook delivery
  `-- WebSocket/SSE/polling path
```

## Architecture After

No major new component is required. This lab produces a launch review and RCA evidence.

## Key Terms

| Term | Meaning |
| --- | --- |
| Functional readiness | Core user workflows work |
| Database readiness | Durable data, backups, and recovery are understood |
| RPO/RTO | Data-loss and recovery-time targets |
| Capacity assumption | Current belief about traffic, CPU, memory, DB, and replicas |
| Rollback plan | How to return to a known-good version |
| Incident communication | Clear update for customers, support, and engineering |
| RCA | Evidence-backed root-cause analysis |

## Must Review

```text
Functional readiness:
Database readiness:
Backup and restore strategy:
RPO/RTO:
Queue and worker behavior:
Webhook delivery:
WebSocket behavior:
Authentication and authorization:
Logs, metrics, and traces:
Security and secret handling:
Capacity assumptions:
Basic load testing:
Rollback considerations:
Incident communication:
RCA:
```

## Basic k6 Scenarios

Use k6 only for focused scenarios after the behavior exists:

```text
Login:
List tickets:
Create ticket:
Add reply:
API latency under concurrency:
```

Capture:

```text
k6 command:
Virtual users:
Duration:
Request rate:
p95 latency:
Error rate:
CPU evidence:
Memory evidence:
Database connection evidence:
Redis evidence:
Replica sizing reasoning:
```

## Controlled Failures

Inject at least four failures:

```text
Database unavailable:
Slow query:
Redis unavailable:
Worker stopped:
Queue backlog:
Webhook receiver returns 500:
Webhook receiver times out:
Duplicate webhook delivery:
WebSocket disconnect:
Application exception:
Reverse-proxy routing error:
```

For each failure, answer:

```text
What did the user see?
Which layer saw the request?
Which layer did not see the request?
What log or metric proves the failed layer?
What did you rule out?
What is the first mitigation?
What would prevent this next time?
```

## Evidence To Capture

```text
Launch decision:
Known risks:
Customer-impacting failure modes:
Monitoring required:
Backup and recovery strategy:
Rollback plan:
Runbook gaps:
Evidence collected:
RCA for one injected incident:
Request ID:
Trace ID:
Mitigation:
Retained takeaway:
```

## Troubleshooting Questions

```text
Can users register, log in, create tickets, list tickets, and receive support replies?
Can admins view and update tickets without exposing internal notes?
Can PostgreSQL data be backed up and restored?
What happens when Redis is unavailable?
What happens when the worker is stopped?
Are webhook failures visible?
Are real-time disconnects understandable?
What would alert before customers report the issue?
What is the first mitigation?
What must be fixed before Phase 3?
```

## Launch Decision

Choose one:

```text
Ready to operate locally.
Ready for a production-like environment.
Not ready because these blockers remain:
```

## Interview Explanation

```text
I would not call the support-ticket app ready just because the happy path works. I would verify core workflows, authorization, database durability, backup and restore expectations, health/readiness behavior, observability, async delivery, real-time update behavior, and a rollback plan. Then I would use focused load tests and injected failures to prove where the service breaks and what evidence supports mitigation.
```

## Completion Standard

```text
The learner can give a two-minute production-readiness review, name known risks, and support one RCA with evidence.
```

## Retained Takeaway

```text
Readiness is a decision backed by evidence, not a feeling that the app seems to work.
```
