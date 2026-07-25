# Phase 3 Labs

These labs document the work needed to prepare, deploy, verify, and troubleshoot a service in a production-like environment.

Kubernetes is one deployment target in this phase. The broader skill is production deployment readiness: runtime configuration, container packaging, security, traffic routing, release management, testing, load, troubleshooting, and rollback.

## Lab Order

| Lab | Focus | Outcome |
| --- | --- | --- |
| [01](01-runtime-configuration/) | Runtime configuration | Run the app with production-style environment settings |
| [02](02-container-image/) | Container image | Build and run a repeatable image |
| [03](03-container-security/) | Container security | Identify image and runtime risks before promotion |
| [04](04-traffic-routing/) | Traffic routing | Trace traffic from edge to container process |
| [05](05-kubernetes-deployment/) | Kubernetes deployment | Deploy the same app with manifests and inspect runtime state |
| [06](06-release-management/) | Release management | Explain version, config, rollout, rollback, and promotion decisions |
| [07](07-testing-load/) | Testing and load | Define test evidence and load-test gates before production |
| [08](08-troubleshooting-readiness/) | Troubleshooting and readiness | Diagnose failed deploys and decide if the service is supportable |
| [09](09-load-balancing-readiness/) | Load balancing readiness | Explain target health, traffic distribution, retries, sticky sessions, and failover |

Put completed evidence and reflections in:

```text
AnswersByGetty/phase-03-production-deployment-foundation/
```
