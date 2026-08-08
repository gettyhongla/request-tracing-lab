# Phase 2 Challenge Scenarios

Challenge mode gives the symptom first. Do not read the likely root-cause notes until after you investigate.

Use the worksheet in `../worksheets/evidence-first-troubleshooting.md`.

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
