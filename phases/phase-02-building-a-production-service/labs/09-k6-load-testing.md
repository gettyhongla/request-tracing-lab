# Lab 09: k6 Load Testing

Use k6 to test the service with repeatable, code-friendly load tests.

Mohamed mentioned JMeter, and JMeter is common in enterprise environments. For this project, k6 is a better fit because the tests are simple JavaScript files that can live with the repo.

## Build

1. Install or run k6.
2. Create a simple k6 script for `/health`.
3. Create a second k6 script for one real app path.
4. Include thresholds for latency and error rate.
5. Run a small local test first.

## Prove

Capture:

```text
k6 command:
Virtual users:
Duration:
Request rate:
p95 latency:
Error rate:
```

## Observe

While k6 runs, check:

```text
Flask logs:
NGINX logs:
CPU:
Memory:
Database connections:
Redis hit/miss behavior:
Readiness behavior:
```

## Done When

You can answer:

```text
What happened to latency as traffic increased?
What happened to error rate?
What resource looked closest to saturation?
What evidence would make you add replicas?
What evidence would make you increase CPU or memory?
What evidence would make you investigate PostgreSQL first?
What evidence would make you investigate Redis first?
```

## Evidence To Capture

```text
k6 script:
k6 output:
p95 latency:
Error rate:
CPU evidence:
Memory evidence:
Database connection evidence:
Redis evidence:
Replica sizing reasoning:
Interview explanation:
Retained takeaway:
```
