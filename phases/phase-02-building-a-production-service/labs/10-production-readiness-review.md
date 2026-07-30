# Lab 10: Failure Injection And Production Readiness Review

Break the service one layer at a time, then review whether the Phase 2 service is ready to move into production operations.

This is the lab that maps most directly to interview prompts like:

```text
Management wants this app in production next week. What do you need before saying yes?
```

## Review

Inject at least four failures:

```text
NGINX cannot reach Flask.
Flask raises an application error.
Flask cannot connect to PostgreSQL.
PostgreSQL responds slowly.
Redis is unavailable or cache behavior is wrong.
/ready fails.
Traffic creates high latency.
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

Answer each section:

```text
Architecture:
Public traffic path:
Private dependency path:
Authentication or session behavior:
PostgreSQL readiness:
Redis cache/session behavior:
Health and readiness:
Logs and request IDs:
Metrics and latency evidence:
Load-test evidence:
CPU and memory evidence:
Replica sizing reasoning:
Known failure modes:
Rollback concerns:
Launch blockers:
```

## Decision

Choose one:

```text
Ready to operate locally.
Ready for a production-like environment.
Not ready because these blockers remain:
```

## Done When

You can give a 2-minute production-readiness answer without reading the file.

## Evidence To Capture

```text
Architecture:
Evidence summary:
Failure evidence:
Readiness decision:
Launch blockers:
Top risks:
Next fixes:
Interview explanation:
Retained takeaway:
```
