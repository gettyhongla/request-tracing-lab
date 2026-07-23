# Kubernetes and Helm Operations Lab

Use this lab to package, deploy, operate, and troubleshoot the request-tracing application in a Kubernetes-style production environment.

The goal is to understand:

```text
How a request flows through Kubernetes
How to package an application into a container
How to deploy with Kubernetes manifests
How Helm changes deployment management
How to troubleshoot by layer
How to reason about production reliability and performance
```

Do not start by copying a finished solution. Create each artifact yourself, test it, break it, and explain the evidence.

---

# Phase 1: Prepare the App for Containers

## Objective

Confirm the Flask app can run in both local and container environments.

## What changed in the app

The app can read runtime settings from environment variables:

```text
FLASK_RUN_HOST
FLASK_RUN_PORT
FLASK_DEBUG
FLASK_SECRET_KEY
JWT_SECRET
```

Local defaults still work:

```bash
python app.py
```

For containers, the app must bind to all interfaces:

```bash
FLASK_RUN_HOST=0.0.0.0 python app.py
```

## Questions

```text
Why does a containerized app usually bind to 0.0.0.0 instead of 127.0.0.1?

Which settings are safe defaults for local development?

Which settings should be provided through environment variables in production?

Why should secrets not be baked into the container image?
```

---

# Phase 2: Package the App into a Container

## Objective

Create your own `Dockerfile` and `.dockerignore`.

## Requirements

Your container should:

```text
Install dependencies from requirements.txt
Copy app.py into the image
Run the Flask application
Expose port 5000
Set FLASK_RUN_HOST=0.0.0.0
Write logs to stdout/stderr
Avoid copying venv, caches, cookies, keys, and Git metadata
Prefer a non-root runtime user
Include or describe a health check for /health
```

## Build and Run

Build:

```bash
docker build -t request-tracing-lab:local .
```

Run:

```bash
docker run --rm \
  -p 5000:5000 \
  -e FLASK_RUN_HOST=0.0.0.0 \
  -e FLASK_DEBUG=false \
  request-tracing-lab:local
```

Test:

```bash
curl -v http://127.0.0.1:5000/health
```

## Record

```text
Image name:

Container port:

Host port:

Health endpoint:

Build command:

Run command:

Successful curl evidence:

Container log evidence:
```

## Troubleshooting Prompts

```text
What happens if the app binds to 127.0.0.1 inside the container?

What happens if the host port is mapped incorrectly?

How do you inspect container logs?

How do you verify the container is listening on the expected port?

How would you keep secrets out of the image?
```

---

# Phase 3: Deploy with Kubernetes Manifests

## Objective

Create plain Kubernetes manifests before using Helm.

## Create These Resources

```text
Namespace
Secret
Deployment
Service
Ingress
HorizontalPodAutoscaler
NetworkPolicy
```

## Request Flow

```text
Client
  |
  v
DNS or local /etc/hosts
  |
  v
Ingress controller
  |
  v
Ingress rule
  |
  v
Service
  |
  v
EndpointSlice / Endpoints
  |
  v
Pod IP
  |
  v
Container port
  |
  v
Flask application
```

## Deployment Requirements

```text
Deployment:
Run at least 2 replicas.
Use the container image you built.
Set FLASK_RUN_HOST=0.0.0.0.
Load FLASK_SECRET_KEY and JWT_SECRET from a Secret.
Add readiness and liveness probes using /health.
Add CPU and memory requests and limits.

Service:
Use ClusterIP.
Route port 80 to the container's HTTP port.
Select Pods by labels.

Ingress:
Route / to the Service.
Choose where TLS would terminate.

HPA:
Scale from 2 to 5 replicas based on CPU.

NetworkPolicy:
Describe or enforce which traffic may reach the Pods.
```

## Apply and Inspect

```bash
kubectl apply -f k8s/
kubectl get all -n request-tracing-lab
kubectl get ingress -n request-tracing-lab
kubectl get endpoints -n request-tracing-lab
kubectl logs -n request-tracing-lab deploy/request-tracing-lab
```

If Ingress is not available, use port forwarding:

```bash
kubectl port-forward -n request-tracing-lab svc/request-tracing-lab 8080:80
curl -v http://127.0.0.1:8080/health
```

## Record

```text
Namespace:

Deployment name:

Replica count:

Pod status:

Service name:

Service selector:

Endpoints present:

Ingress host:

Readiness probe:

Liveness probe:

Request ID test:

Matching app log:
```

---

# Phase 4: Deploy with Helm

## Objective

Convert the working Kubernetes manifests into a Helm chart.

## Create a Chart

```bash
helm create request-tracing-lab
```

Then simplify the generated chart so it matches this app.

## Values to Template

```text
image.repository
image.tag
image.pullPolicy
replicaCount
service.port
service.targetPort
ingress.enabled
ingress.host
resources.requests
resources.limits
probes.readiness.path
probes.liveness.path
autoscaling.enabled
autoscaling.minReplicas
autoscaling.maxReplicas
secrets.FLASK_SECRET_KEY
secrets.JWT_SECRET
```

## Render Before Deploying

```bash
helm template request-tracing-lab ./helm/request-tracing-lab
```

## Install or Upgrade

```bash
helm upgrade --install request-tracing-lab ./helm/request-tracing-lab \
  --namespace request-tracing-lab \
  --create-namespace
```

## Inspect

```bash
helm list -n request-tracing-lab
helm status request-tracing-lab -n request-tracing-lab
helm get values request-tracing-lab -n request-tracing-lab
helm get manifest request-tracing-lab -n request-tracing-lab
helm history request-tracing-lab -n request-tracing-lab
```

## Roll Back

```bash
helm rollback request-tracing-lab <revision> -n request-tracing-lab
```

## Questions

```text
Which settings belong in values.yaml?

Which values should differ between local, staging, and production?

How do you preview what Helm will create?

How do you see what values were used for a deployed release?

How do you roll back a bad release?

How can a bad values change break image pulls, Service routing, probes, or Ingress?
```

---

# Phase 5: Structured Kubernetes Troubleshooting

Start broad, then narrow.

## 1. Is the Workload Running?

```bash
kubectl get pods -n request-tracing-lab
kubectl get deploy -n request-tracing-lab
kubectl describe deploy request-tracing-lab -n request-tracing-lab
```

Look for:

```text
READY
STATUS
RESTARTS
AVAILABLE
Conditions
Events
```

## 2. Did the Container Start?

```bash
kubectl describe pod <pod-name> -n request-tracing-lab
kubectl logs <pod-name> -n request-tracing-lab
kubectl logs <pod-name> -n request-tracing-lab --previous
```

Use `--previous` when a container restarted and current logs do not show the crash.

## 3. Is the Pod Ready?

```bash
kubectl get pods -n request-tracing-lab
kubectl describe pod <pod-name> -n request-tracing-lab
```

If readiness fails, the Pod may be running but removed from Service traffic.

## 4. Does the Service Have Endpoints?

```bash
kubectl get svc -n request-tracing-lab
kubectl describe svc request-tracing-lab -n request-tracing-lab
kubectl get endpoints -n request-tracing-lab
kubectl get endpointslice -n request-tracing-lab
```

If the Service has no endpoints, check:

```text
Selector labels
Pod labels
Readiness probe
Namespace
Target port
```

## 5. Is Ingress Routing Correctly?

```bash
kubectl get ingress -n request-tracing-lab
kubectl describe ingress request-tracing-lab -n request-tracing-lab
kubectl get ingressclass
```

Check:

```text
Host
Path
Ingress class
Backend Service
Backend port
TLS config
Ingress controller logs
```

## 6. What Changed in Helm?

```bash
helm history request-tracing-lab -n request-tracing-lab
helm get values request-tracing-lab -n request-tracing-lab
helm get manifest request-tracing-lab -n request-tracing-lab
```

---

# Phase 6: Break and Diagnose

Complete these scenarios after you have a working deployment.

## Scenario 1: Bad Image

Break:

```text
Set image.repository or image.tag to a value that does not exist.
```

Expected symptom:

```text
ImagePullBackOff
ErrImagePull
```

Commands:

```bash
kubectl get pods -n request-tracing-lab
kubectl describe pod <pod-name> -n request-tracing-lab
kubectl get events -n request-tracing-lab --sort-by=.lastTimestamp
```

Diagnosis:

```text
Failure layer:
Image registry or deployment configuration.
```

## Scenario 2: Service Has No Endpoints

Break:

```text
Make the Service selector not match the Pod labels.
```

Commands:

```bash
kubectl get endpoints -n request-tracing-lab
kubectl describe svc request-tracing-lab -n request-tracing-lab
kubectl get pods -n request-tracing-lab --show-labels
```

Diagnosis:

```text
Failure layer:
Service-to-Pod discovery.
```

## Scenario 3: Pod Running but Not Ready

Break:

```text
Set readinessProbe.path to /not-ready.
```

Commands:

```bash
kubectl get pods -n request-tracing-lab
kubectl describe pod <pod-name> -n request-tracing-lab
kubectl get endpoints -n request-tracing-lab
```

Diagnosis:

```text
Failure layer:
Health check / readiness gate.
```

## Scenario 4: Wrong Port

Break:

```text
Set the Service targetPort to a port where the container is not listening.
```

Commands:

```bash
kubectl describe svc request-tracing-lab -n request-tracing-lab
kubectl describe pod <pod-name> -n request-tracing-lab
curl -v http://127.0.0.1:8080/health
```

Diagnosis:

```text
Failure layer:
Service-to-container port wiring.
```

## Scenario 5: Application Error

Trigger:

```bash
curl -v \
  -H "X-Request-ID: k8s-error-001" \
  http://127.0.0.1:8080/error
```

Commands:

```bash
kubectl logs -n request-tracing-lab deploy/request-tracing-lab
```

Expected evidence:

```text
application_error request_id=k8s-error-001
RuntimeError: Simulated application failure
request_finished request_id=k8s-error-001 status=500
```

Diagnosis:

```text
Failure layer:
Application code.
```

---

# Phase 7: Performance and Reliability

## What to Monitor

```text
Request rate
Error rate
Latency percentiles
Pod restarts
Readiness failures
CPU usage
Memory usage
Network errors
Ingress 4xx and 5xx responses
Dependency errors
```

## Scale or Debug?

Scale when evidence shows saturation:

```text
CPU high
Memory pressure
Queue depth rising
Pods at request limits
Latency improves when replicas increase
```

Dig deeper when evidence points to root cause:

```text
One endpoint is slow
Database or external dependency is slow
Errors increased without resource saturation
Only one Pod is failing
Readiness or liveness probes are misconfigured
NetworkPolicy or DNS is blocking traffic
```

## Production Readiness Checklist

```text
Health endpoint exists
Readiness and liveness probes configured
Resource requests and limits set
Secrets are not baked into images
Logs go to stdout/stderr
Request IDs appear in logs
Metrics and alerts exist
Rollback path is known
Ingress/TLS behavior is documented
Helm values are environment-specific
Runbook exists for common failures
```

---

# Bonus: Virtual Appliance Thinking

Blitzy described a remote virtual appliance deployed into customer environments. For this lab, treat the Kubernetes deployment as a simplified appliance.

Think through:

```text
How is it installed?

What customer environment assumptions does it make?

What network access does it need?

How are upgrades performed?

How are logs collected without exposing customer secrets?

How are health and readiness reported?

How would support collect diagnostics?

What is safe to automate?

What needs human approval?
```

Optional extension:

```text
Create a diagnostics script that collects:
kubectl get pods
kubectl describe pods
kubectl get svc
kubectl get endpoints
kubectl get ingress
kubectl get events
helm status
helm values
recent application logs
```

Do not collect secrets or full tokens.
