# Lab 08: Basic Observability

Define the minimum useful observability for this service.

Observability is not a dashboard collection. It is the ability to answer questions from evidence.

## Build

Add or document signals for:

```text
Request count
Error count
Request latency
Health status
Readiness status
Database query duration
Database connection failures
Redis cache hits and misses
Redis connection failures
```

You can start simple. Logs and basic counters are enough for this phase.

## Prove

For one healthy request and one failed request, capture:

```text
Log evidence:
Metric or counter evidence:
Latency evidence:
Request ID:
```

## Break

Cause one failure and explain which signal would help you notice it first.

## Done When

You can answer:

```text
What would I check first if users report slow login?
What would I check first if users report intermittent 500s?
What would I check first if /ready starts failing?
What would I check first if cache hit rate drops?
```

## Evidence To Capture

```text
Signals added:
Healthy request evidence:
Failed request evidence:
Latency evidence:
First check for slow login:
First check for 500 errors:
First check for Redis/cache issues:
Interview explanation:
Retained takeaway:
```
