# 07: Testing And Load

Goal:

```text
Define the evidence required before saying a release is safe to deploy.
```

Test gates:

* Unit tests
* Integration tests
* Smoke tests
* Regression checks for critical paths
* Container build verification
* Configuration validation
* Image and dependency scan review

Load-test questions:

```text
How many requests per second can this deployment handle?
At what latency?
At what error rate?
Which resource saturates first?
Does scaling improve the bottleneck?
What happens when a dependency slows down?
```

Record:

```text
Test shape:
Expected traffic:
Peak traffic:
Duration:
Success rate:
p50 latency:
p95 latency:
p99 latency:
Error rate:
CPU:
Memory:
Bottleneck:
Production recommendation:
```

Completion standard:

```text
You can explain whether the release is safe to promote, pause, roll back, or roll forward.
```
