# Kubernetes Manifests

These manifests deploy the same Flask request-tracing app from this repository into a Kubernetes-style environment.

Use them after completing the container packaging lab.

## Files

| File | Purpose |
| --- | --- |
| `namespace.yaml` | Creates the `request-tracing-lab` namespace |
| `secret.example.yaml` | Provides example runtime secrets for Flask sessions and JWT signing |
| `deployment.yaml` | Runs two Flask application replicas from the container image |
| `service.yaml` | Exposes the ready Pods through a stable ClusterIP Service |
| `ingress.yaml` | Routes HTTP traffic from an ingress controller to the Service |
| `hpa.yaml` | Defines CPU-based horizontal scaling from 2 to 5 replicas |
| `networkpolicy.yaml` | Documents/enforces inbound traffic rules for the app Pods |

## Apply

```bash
kubectl apply -f phases/phase-03-production-deployment-foundation/labs/05-kubernetes-deployment/manifests/
```

## Inspect

```bash
kubectl get all -n request-tracing-lab
kubectl get ingress -n request-tracing-lab
kubectl get endpoints -n request-tracing-lab
kubectl logs -n request-tracing-lab deploy/request-tracing-lab
```

## Request Flow

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
Flask container
```

The key production skill is to prove which layer handled the request and which layer failed.
