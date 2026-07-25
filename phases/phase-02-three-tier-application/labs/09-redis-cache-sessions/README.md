# 09: Redis Cache Or Sessions

Goal:

```text
Separate Redis behavior from PostgreSQL source-of-truth behavior.
```

Evidence Tasks:

* Decide whether Redis owns cache, sessions, rate limits, or queue state.
* Identify cache hit, miss, expiry, and stale-data behavior.
* Decide what happens when Redis is unavailable.
* Explain whether the app should fail closed, fail open, or degrade gracefully.
* Identify metrics for cache pressure.

Questions:

```text
Is Redis the source of truth?
What is the TTL?
What happens on cache miss?
What happens if Redis is down?
Can stale data hurt customers?
What metric proves Redis is helping or hurting?
```

Completion standard:

```text
You can explain when Redis improves performance and when it introduces failure risk.
```
