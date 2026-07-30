# Production Reviews

Production reviews are interview-style architecture and troubleshooting exercises.

They are generic, NDA-safe scenarios that practice the judgment behind production engineering: request paths, dependencies, evidence, launch blockers, mitigation, rollback, and communication.

## Reviews

| Review | Focus |
| --- | --- |
| [01](01-production-launch-review.md) | Decide whether a service is safe to launch |
| [02](02-slow-login-investigation.md) | Investigate slow login from symptom to evidence |
| [03](03-database-latency.md) | Prove or disprove database latency as the bottleneck |
| [04](04-502-bad-gateway.md) | Diagnose proxy, upstream, and app availability failures |
| [05](05-resource-sizing.md) | Reason about replicas, CPU, memory, and load testing |

## Review Format

```text
Scenario:
Customer symptom:
Architecture:
Request path:
Dependencies:
Healthy behavior:
Evidence to collect:
Likely causes:
What to rule out:
Mitigation:
Rollback or roll-forward:
Customer update:
Engineering follow-up:
Retained takeaway:
```

Do not start with a list of tools. Start with the customer, the request path, the data, and the evidence.
