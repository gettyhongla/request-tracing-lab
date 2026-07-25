# Kubernetes Operator Concepts

This is a short reference for operating the Flask app in Kubernetes.

The goal is not to memorize object names. The goal is to know which layer owns which behavior and what evidence proves that layer is healthy or broken.

## Mental Model

```text
Deployment declares the desired app version and replica count.
ReplicaSet keeps the right number of Pods alive.
Pod runs the container.
Service gives ready Pods a stable network name.
Ingress routes external HTTP traffic to the Service.
Secret provides runtime-sensitive configuration.
HPA changes replica count based on metrics.
NetworkPolicy controls allowed traffic.
```

## Request Path

```text
Client
  |
  v
Ingress
  |
  v
Service
  |
  v
EndpointSlice / Endpoints
  |
  v
Pod
  |
  v
Container
  |
  v
Flask route
```

## Evidence By Layer

| Layer | What it proves | Commands |
| --- | --- | --- |
| Ingress | External route and host/path behavior | `kubectl get ingress`, `kubectl describe ingress` |
| Service | Stable routing target and port mapping | `kubectl get svc`, `kubectl describe svc` |
| Endpoints | Which ready Pods can receive traffic | `kubectl get endpoints`, `kubectl get endpointslice` |
| Deployment | Desired replicas and rollout state | `kubectl get deploy`, `kubectl describe deploy` |
| Pod | Runtime status, node, IP, restarts, events | `kubectl get pods -o wide`, `kubectl describe pod` |
| Container | App startup and runtime logs | `kubectl logs`, `kubectl logs --previous` |
| Application | Route, auth, request ID, status, exception | Flask logs and response headers |

## Common Failure Patterns

```text
ImagePullBackOff:
Image name, tag, registry access, or pull policy problem.

CrashLoopBackOff:
Container starts and exits repeatedly. Check logs, command, environment variables, and secrets.

Pod Running but Not Ready:
Readiness probe failed. The Pod may exist but should not receive traffic.

Service Has No Endpoints:
Selector mismatch, wrong namespace, failed readiness, or missing Pods.

502 or 503:
Ingress or proxy reached no healthy backend, wrong service, wrong port, or no ready endpoints.

Application 500:
Traffic reached Flask. Check request ID and application logs.
```

## Troubleshooting Order

Start with the customer symptom, then move inward:

```text
Client response
Ingress route
Service routing
Endpoints
Pod readiness
Container logs
Application logs
Dependency evidence
```

At each step, ask:

```text
Did the request reach this layer?
What should this layer have done next?
What evidence proves it worked or failed?
What nearby layer can I rule out?
```
