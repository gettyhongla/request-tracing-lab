# Phase 2 Challenge Scenarios

Challenge mode gives the symptom first. Do not read the likely root-cause notes until after you investigate.

## How To Work A Challenge

```text
1. Establish healthy state first.
2. Inject or encounter one failure.
3. Observe the exact symptom.
4. Draw the expected request path.
5. Identify known-good boundaries.
6. Identify the first unknown boundary.
7. Gather evidence.
8. Form a hypothesis.
9. Test it.
10. Fix the failure.
11. Validate recovery.
12. Document what was learned.
```

## Investigation Template

### Observed Symptom

```text
What exactly failed?
What did the client, user, or system actually report?
Avoid naming a root cause yet.
```

### Expected Request Path

```text
Draw the expected path:
client -> NGINX -> API -> dependency
```

### Known-Good Boundaries

```text
What evidence proves a boundary worked?
Client evidence:
NGINX access log:
NGINX error log:
Flask log:
Redis evidence:
PostgreSQL evidence:
```

### First Unknown Boundary

```text
Where does certainty stop?
What is the next boundary to prove?
```

### Evidence Needed

```text
What command, log, or status would prove or disprove the next hop?
Why does this evidence answer that question?
What would it NOT prove?
```

### Evidence Collected

```text
Paste actual output here.
```

### Hypothesis

```text
Based on the evidence, what is the most likely failed boundary?
```

### Test

```text
What check would confirm or reject the hypothesis?
```

### Root Cause

```text
What actually failed?
```

### Fix

```text
What changed?
```

### Validation

```text
What proves the original behavior recovered?
```

### Improvement

```text
Could this be detected earlier?
Could it be prevented?
Could it be documented?
Could it be monitored?
Could a safe validation or automation step catch it next time?
```

## NGINX / Upstream Challenges

| Challenge | Symptom | Start With |
| --- | --- | --- |
| Wrong upstream port | Client receives 502 | Client response, NGINX error log, Flask log absence |
| Upstream process stopped | Client receives 502 or connection error | NGINX error log, process/listening-port evidence |
| Upstream timeout | Client waits, then receives timeout-style failure | NGINX error log, upstream timeout config, Flask timing |
| Protocol mismatch | Proxy cannot speak to upstream correctly | NGINX error log and upstream scheme/port |
| App returns 500 | Client receives 500 | Flask error log with request ID |

## Redis Challenges

| Challenge | Symptom | Start With |
| --- | --- | --- |
| Redis stopped | Cache/session path degrades or fails | Flask Redis error, Redis process status |
| Wrong Redis port | Connection refused | App config and TCP port evidence |
| Expired key | Cache miss or missing session behavior | TTL, key lookup, application fallback |
| Redis latency | Slow request without DB evidence | App timing around Redis boundary |

## PostgreSQL Challenges

| Challenge | Symptom | Start With |
| --- | --- | --- |
| Wrong DB port | API returns dependency failure | Flask DB error and connection string |
| Slow query | High latency | Query timing and request timing |
| Transaction rollback | Expected row missing | SQL transaction evidence |

## Communication Standard

After each challenge, write:

```text
Quick explanation:
Detailed technical explanation:
Teach another learner:
```
