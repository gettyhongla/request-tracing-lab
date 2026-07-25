# Phase 6: Distributed Services

Phase 6 splits responsibilities only after the monolith, proxy, database, cache, and queue paths are understood.

Focus:

* Service boundaries
* Gateway behavior
* Request propagation
* Timeouts and retries
* Circuit breakers
* Partial failure
* Service-to-service authentication
* Finding the failed hop with logs, metrics, traces, queue state, and database rows

Completion standard:

```text
Given a multi-service request, identify which service or dependency failed, which evidence proves it, and whether the customer experienced total failure, partial failure, or degraded behavior.
```
