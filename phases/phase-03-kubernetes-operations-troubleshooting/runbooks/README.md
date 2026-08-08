# Phase 3 Runbooks

Runbooks turn repeated troubleshooting into a consistent operating process.

They should not be command dumps. Each runbook should help the learner identify the failed path, collect evidence, make decisions, remediate safely, validate recovery, and decide whether monitoring, documentation, validation, or automation would reduce recurrence.

## Available Runbooks

| Runbook | Primary Path |
| --- | --- |
| [Pod not created](kubernetes-pod-not-created.md) | Deployment -> ReplicaSet -> Pod |
| [Pod not ready](kubernetes-pod-not-ready.md) | Service -> EndpointSlice -> Ready Pod |
| [Service has no endpoints](kubernetes-service-no-endpoints.md) | Service -> EndpointSlice |
| [Ingress 502](ingress-502.md) | Client -> Ingress -> Service -> EndpointSlice -> Pod |
| [Bad Helm release](bad-helm-release.md) | Helm values -> rendered manifest -> Kubernetes object -> runtime behavior |
| [Rollback deployment](rollback-deployment.md) | rollout history -> revision selection -> validation |

## Escalation Standard

Include:

```text
Observed impact:
Environment:
Relevant timestamps:
Reproduction steps:
Expected behavior:
Actual behavior:
Request IDs if available:
Logs/events:
Relevant configuration:
Failed boundary:
What has been ruled out:
Current hypothesis:
Exact help needed:
```
