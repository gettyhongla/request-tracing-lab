# Phase 3 Challenge Scenarios

Use these after completing the guided labs. A challenge gives the symptom first; the learner must decide whether the failure is in the management path, traffic path, dependency path, or release path.

## Challenge Set

| Challenge | Symptom | Likely Path To Investigate |
| --- | --- | --- |
| Pod never appears | Deployment exists, but no usable Pod is created | Management path |
| Pod stays Pending | Pod exists but never starts | Scheduler/node/resource path |
| Image cannot be pulled | Pod reports ImagePullBackOff | Image/runtime path |
| Container keeps restarting | Pod reports CrashLoopBackOff | Container process/config path |
| Pod runs but is not Ready | Service has no ready backend | Readiness path |
| Service has no endpoints | Service exists but has no EndpointSlice addresses | Service selector/readiness path |
| Service traffic fails | Pod works directly, Service path fails | Service port/targetPort path |
| Ingress returns 502 or 503 | Client reaches Ingress but not the app | Ingress -> Service -> EndpointSlice path |
| Redis route degrades | App is reachable, cache behavior changes or errors | Dependency path |
| PostgreSQL-backed route fails | App is reachable, durable-data workflow fails | Dependency/schema path |
| Rollout introduces a regression | New revision does not behave like the previous one | Release path |
| Helm value breaks routing | Rendered manifests apply but traffic fails | Helm values -> Kubernetes object path |

## Rule

Start with the path. Then collect the smallest evidence that proves the first failed boundary.
