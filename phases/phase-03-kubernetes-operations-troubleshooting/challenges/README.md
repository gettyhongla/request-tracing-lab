# Phase 3 Kubernetes Challenge Labs

Each challenge should have a guided version and a challenge version.

The challenge version gives only the symptom. Use `../worksheets/kubernetes-troubleshooting.md`.

## Workload Creation

| Challenge | Symptom |
| --- | --- |
| Deployment applies but no Pod appears | Deployment exists, no usable Pod |
| ReplicaSet cannot create Pods | ReplicaSet exists, desired replicas unmet |
| Pod Pending | Pod never starts |
| ImagePullBackOff | Pod cannot pull image |
| CrashLoopBackOff | container repeatedly exits |
| Missing ConfigMap | Pod cannot start or app misconfigures |
| Missing Secret | Pod cannot start or app rejects config |
| Resource request prevents scheduling | Pod stays Pending |

## Readiness And Runtime

| Challenge | Symptom |
| --- | --- |
| Pod Running but not Ready | Service has no ready endpoint |
| Incorrect readiness probe | app works manually but not ready |
| Liveness probe restarts healthy app | unexpected restarts |
| Wrong application port | container running, traffic fails |
| Service cannot reach healthy app | local Pod curl works, Service path fails |

## Service And Ingress

| Challenge | Symptom |
| --- | --- |
| Service selector mismatch | Service has no EndpointSlice addresses |
| Wrong targetPort | Service exists but backend traffic fails |
| DNS/service-name failure | app cannot reach dependency |
| Ingress points to wrong Service | client cannot reach expected backend |
| Ingress returns 404 | route/rule/controller mismatch |
| Ingress/proxy returns 502 | backend route exists but upstream fails |

## Rule

Do not start by guessing. Start by identifying which path is failing: management, traffic, or dependency.
