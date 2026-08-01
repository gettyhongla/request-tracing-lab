# Lab 12: Logs, Metrics, Traces, And Request IDs

Correlate evidence across the support-ticket request path.

## Why This Lab Exists

Observability is not a dashboard collection. It is the ability to answer questions from evidence.

When a customer says "my ticket submission failed" or "support replies are not updating," you need a path from symptom to request ID, logs, database rows, cache behavior, queue/worker state, webhook delivery, and real-time update evidence.

## Architecture Before

```text
Client -> NGINX -> Flask -> PostgreSQL / Redis
```

## Architecture After

```text
Customer symptom
  |
  v
Request ID or trace ID
  |
  v
NGINX or edge log
  |
  v
Flask API log
  |
  v
PostgreSQL or Redis evidence
  |
  v
Queue/worker, webhook, or WebSocket evidence
  |
  v
Conclusion
```

## Key Terms

| Term | Meaning |
| --- | --- |
| Structured log | Log with consistent fields |
| Log level | Severity such as info, warning, error |
| Request ID | Identifier for one request |
| Trace ID | Identifier for a request path across multiple spans |
| Span | One timed operation inside a trace |
| Context propagation | Passing IDs across services or async work |
| Metric | Numeric measurement over time |
| p50/p95/p99 | Latency percentiles |
| Saturation | Resource near its limit |
| Safe logging | Avoiding passwords, cookies, tokens, and sensitive content |

## Must Implement Or Inspect

1. Ensure every request has an `X-Request-ID`.
2. Make NGINX pass the request ID to Flask.
3. Make Flask include the request ID in responses.
4. Log method, path, status code, request ID, and duration.
5. Log ticket ID, user ID, job ID, or webhook event ID when relevant.
6. Identify metrics for request rate, error rate, latency, saturation, database connections, query duration, cache hit rate, queue depth, worker failures, webhook failures, and active WebSocket connections.
7. Describe traces and spans conceptually.
8. Avoid logging passwords, session cookies, access tokens, or sensitive ticket content.

## Healthy-Path Verification

Send one request and capture:

```text
Client response header:
NGINX access log:
Flask log:
Request ID match:
Request duration:
PostgreSQL evidence:
Redis evidence, if relevant:
```

## Controlled Failures

Test at least two:

```text
Slow request:
Database unavailable:
Redis unavailable:
Worker backlog:
Webhook delivery failure:
WebSocket disconnect:
Application exception:
```

## Evidence To Capture

```text
Request ID:
Trace ID:
Client evidence:
Proxy evidence:
API evidence:
PostgreSQL evidence:
Redis evidence:
Worker or queue evidence:
Webhook evidence:
WebSocket evidence:
Latency:
Error rate:
Mitigation:
RCA conclusion:
Interview explanation:
Retained takeaway:
```

## Metrics To Know

```text
Request rate:
Error rate:
Latency:
p50:
p95:
p99:
Database connections:
Query duration:
Cache hit rate:
Queue depth:
Worker failures:
Webhook delivery failures:
Active WebSocket connections:
```

## Troubleshooting Questions

```text
Where did the request enter?
Which request ID or trace ID connects the evidence?
Did NGINX forward the request?
Did Flask handle it?
Did PostgreSQL commit data?
Was Redis a cache miss, cache hit, or unavailable?
Is the queue growing?
Did the webhook receiver respond?
Did the browser keep a real-time connection open?
What did you rule out?
What is the first mitigation?
```

## Interview Explanation

```text
Request IDs connect client evidence to proxy and application logs. Metrics show patterns such as rate, errors, latency, saturation, queue depth, and cache behavior. Traces describe parent-child timing across HTTP, database, async jobs, and webhook delivery. Good observability lets us move from symptom to evidence to mitigation without guessing.
```

## Completion Standard

```text
The learner can trace one customer symptom across client, NGINX, Flask, PostgreSQL, Redis, and any async or real-time path using request IDs, logs, metrics, and trace concepts.
```

## Retained Takeaway

```text
Evidence is useful when it is correlated. A log line without a request ID is just a clue; a correlated path can become an RCA.
```
