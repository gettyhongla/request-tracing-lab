# Phase 3 Runbooks

Runbooks turn repeated troubleshooting into a consistent operating process.

Use them after identifying whether the failure is in the management path, traffic path, dependency path, or release path.

```text
Management path: Deployment -> ReplicaSet -> Pod
Traffic path: Client -> Ingress -> Service -> EndpointSlice -> Ready Pod -> Container -> Application -> Dependency
```

## Available Runbooks

| Runbook | Primary Path |
| --- | --- |
| [Pod not created](kubernetes-pod-not-created.md) | Deployment -> ReplicaSet -> Pod |
| [Pod Pending](pod-pending.md) | Scheduler -> node capacity -> volume/config constraints |
| [Pod Running but NotReady](kubernetes-pod-not-ready.md) | Pod -> readiness probe -> Service endpoint eligibility |
| [CrashLoopBackOff](crashloopbackoff.md) | Container process -> logs -> command/config/runtime dependency |
| [ImagePullBackOff](imagepullbackoff.md) | Pod spec -> image reference -> node image availability/pull permission |
| [Service has no endpoints](kubernetes-service-no-endpoints.md) | Service selector -> EndpointSlice -> Ready Pod |
| [Ingress 502/503](ingress-502.md) | Client -> Ingress -> Service -> EndpointSlice -> Pod |
| [Redis/dependency connectivity failure](dependency-connectivity-failure.md) | Application -> dependency DNS/port/config |
| [Bad Helm release](bad-helm-release.md) | Helm values -> rendered manifest -> Kubernetes object -> runtime behavior |
| [Rollback deployment](rollback-deployment.md) | rollout history -> revision selection -> validation |

## Evidence Standard

Capture:

```text
Observed symptom:
Expected path:
Known-good boundaries:
First unknown boundary:
Command or inspection used:
Evidence:
Root cause or strongest hypothesis:
Fix or mitigation:
Validation:
Prevention or automation note:
```

Do not let a runbook become a command dump. Each command should explain which boundary it tests.
