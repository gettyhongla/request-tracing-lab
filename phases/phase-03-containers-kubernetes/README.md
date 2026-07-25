# Phase 3: Production Deployment Foundation

Phase 3 turns the app into something that can be deployed and operated in a production-like environment.

The focus is not Kubernetes trivia. The focus is the deployment skillset: package the app, configure it safely, expose it through the platform, verify that it is healthy, and recover when a release fails.

Focus:

* Repeatable builds
* Container image integrity
* Runtime configuration
* Environment variables and secrets
* Health, readiness, and startup checks
* Release versioning
* Deployment verification
* Rollback and roll-forward decisions
* Services, Deployments, ReplicaSets, and Pods
* `CrashLoopBackOff`, `ImagePullBackOff`, and `OOMKilled`
* Cluster DNS and dependency connectivity
* Identifying which pod and version handled a request

## Deployment Path

```text
Source code
   |
   v
Build image
   |
   v
Configure runtime
   |
   v
Deploy release
   |
   v
Run health checks
   |
   v
Route traffic
   |
   v
Observe logs, metrics, and traces
   |
   v
Rollback or promote
```

## Production Questions

For every deployment, answer:

```text
What version is running?
Which configuration did it receive?
Where are secrets coming from?
Which health check proves the app is alive?
Which readiness check proves it can serve customer traffic?
Which logs prove the new version handled a request?
Which metrics prove the release is healthy?
What is the rollback command or rollback plan?
What customer symptom would appear if this deploy failed?
```

## Deployment Failure Classes

| Failure | Customer symptom | Evidence |
| --- | --- | --- |
| Bad image | App never starts | Image pull events, container status |
| Bad command or env var | Crash loop | Container logs, exit code |
| Bad secret | Auth or dependency failure | App logs, secret reference, dependency logs |
| Failed readiness | No traffic or partial traffic | Readiness events, endpoint state |
| Wrong service selector | 503 or no backend | Service endpoints, labels |
| Bad rollout | Some users hit old or broken version | Version field in logs/responses |
| Resource pressure | Slow or restarting app | CPU, memory, OOM events |

Completion standard:

```text
Given a failed deployment or failed request after deployment, explain whether the failure is build, image, configuration, secret, health check, service routing, DNS, resource pressure, rollout version, or application behavior.
```
