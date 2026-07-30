# Phase 3: Operating a Production Service

Phase 3 takes the service from "built" to "operable."

The focus is not Kubernetes trivia. The focus is the operational skillset: package the system, configure it safely, make it observable, alert on customer-impacting behavior, verify deployments, roll back safely, migrate toward Kubernetes, and communicate incidents clearly.

Redis appears in Phase 2 as a cache/session dependency beside the synchronous request path. Workers and queues belong to the larger production architecture path: once the synchronous request path is understood, async work can move into Kubernetes workers backed by Redis, Kafka, or another queue.

Use this distinction:

```text
Synchronous:
The browser waits for the request to finish.

Asynchronous:
The request triggers work that another process finishes later.

Real-time:
The user receives live or near-live updates while something changes.
```

Async is not automatically real-time. A report generation job can be async and finish later with no live updates. A real-time progress bar may use async workers plus WebSockets, polling, or server-sent events to report progress.

## Contents

```text
README.md
labs/
docker/
kubernetes/
observability/
runbooks/
```

## Lab Order

| Lab | Focus | Outcome |
| --- | --- | --- |
| [01](labs/01-containerize-the-system.md) | Containerize the system | Build and run the service as a repeatable container image |
| [02](labs/02-configuration-and-secrets.md) | Configuration and secrets | Separate code, config, secrets, and runtime behavior |
| [03](labs/03-observability.md) | Observability | Define logs, metrics, traces, dashboards, and request IDs |
| [04](labs/04-alerting-and-supportability.md) | Alerting and supportability | Decide what should page someone and what support needs to diagnose issues |
| [05](labs/05-deployment-verification.md) | Deployment verification | Prove a release is healthy before and after traffic reaches it |
| [06](labs/06-rollback-and-release-safety.md) | Rollback and release safety | Define rollback, roll-forward, and release-risk decisions |
| [07](labs/07-kubernetes-migration.md) | Kubernetes migration | Map the service to Kubernetes objects and traffic flow |
| [08](labs/08-production-incident.md) | Production incident | Investigate a realistic incident, including sync vs async failure modes, and write the RCA |

## Evidence Standard

Each completed lab belongs in:

```text
AnswersByGetty/phase-03-operating-a-production-service/labs/
```

Use this worksheet:

```text
Operational goal:
Architecture or deployment path:
Configuration used:
Commands run:
Verification evidence:
Logs, metrics, or traces:
Failure mode tested:
Customer impact:
Mitigation:
Rollback or roll-forward decision:
Runbook update:
Retained takeaway:
```

## Finish Line

Phase 3 is complete when you can answer:

```text
What version is running?
How was it configured?
How do we know it is healthy?
How do we know customers are not impacted?
What alerts would fire?
How do we roll back safely?
What evidence proves the deploy caused or did not cause the issue?
What would support, engineering, and customers each need to hear?
```
