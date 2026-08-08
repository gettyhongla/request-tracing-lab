# Phase 3 Answers: Containerized Systems And Kubernetes Troubleshooting

This document records completed Phase 3 evidence, conclusions, and retained takeaways.

The canonical lab instructions live in [Phase 3 LABS.md](../phases/phase-03-kubernetes-operations-troubleshooting/LABS.md). This answer file intentionally follows the same lab numbers and titles.

## Recorded Labs

| Lab | Topic | Status |
| --- | --- | --- |
| [Lab 01](#lab-01-images-dockerfiles--buildruntime-boundaries) | Images, Dockerfiles & Build/Runtime Boundaries | Recorded |
| [Lab 02](#lab-02-runtime-configuration-ports-processes--filesystem) | Runtime Configuration, Ports, Processes & Filesystem | Recorded |
| [Lab 03](#lab-03-docker-networking-dns--container-health) | Docker Networking, DNS & Container Health | Not yet captured |
| [Lab 04](#lab-04-docker-compose-full-stack-operations) | Docker Compose Full-Stack Operations | Manual validation required |
| [Lab 05](#lab-05-kubernetes-workloads--traffic-path-troubleshooting) | Kubernetes Workloads & Traffic-Path Troubleshooting | Recorded |
| [Lab 06](#lab-06-readiness-dependencies-dns-config--resource-failures) | Readiness, Dependencies, DNS, Config & Resource Failures | Partially recorded |
| [Lab 07](#lab-07-rollouts-releases-rollback--persistent-state) | Rollouts, Releases, Rollback & Persistent State | Not yet captured |
| [Lab 08](#lab-08-helm-complex-incident-runbook--diagnostic-automation) | Helm, Complex Incident, Runbook & Diagnostic Automation | Not yet captured |

## Lab 01: Images, Dockerfiles & Build/Runtime Boundaries

### Must Implement Or Inspect

#### 1. Inspect the Dockerfile

File inspected:

```text
Dockerfile
```

What it contains:

```text
Python base image
/app working directory
requirements.txt dependency install
app.py copy
container-friendly FLASK_RUN_* defaults
non-root app user
port 5001 exposure
/health Docker health check
python app.py startup command
```

#### 2. Inspect .dockerignore

File inspected:

```text
.dockerignore
```

What it excludes:

```text
venv/
.venv/
__pycache__/
.git/
.env
*.pem
*.key
cookies.txt
```

Evidence:

```text
Local virtual environments, Python caches, Git history, environment files, certificates, keys, and cookie files are excluded from the Docker build context.
```

#### 3. Build the application image

Command:

```bash
docker build -t request-tracing-lab:local .
```

Observed build result:

```text
[+] Building 2.2s (11/11) FINISHED
load build definition from Dockerfile
load .dockerignore
load build context
CACHED [2/6] WORKDIR /app
CACHED [3/6] RUN addgroup --system app && adduser --system --ingroup app app
CACHED [4/6] COPY requirements.txt .
CACHED [5/6] RUN python -m pip install --no-cache-dir --upgrade pip && python -m pip install --no-cache-dir -r requirements.txt
CACHED [6/6] COPY app.py .
naming to docker.io/library/request-tracing-lab:local
```

What this proves:

```text
Docker found the build definition and build context, installed dependencies, copied the application, and created the local image tag request-tracing-lab:local.
```

#### 4. Explain build-time work

```text
Build time installed Python dependencies, copied source files, created the non-root user, recorded image metadata, and produced the reusable image.
```

#### 5. Explain runtime configuration

```text
FLASK_RUN_HOST, FLASK_RUN_PORT, FLASK_DEBUG, FLASK_SECRET_KEY, JWT_SECRET, DATABASE_URL, and REDIS_URL are runtime settings. They should be supplied when the container starts, not baked into the image.
```

#### 6. Run the container

Command:

```bash
docker run --rm   -p 5001:5001   -e FLASK_RUN_HOST=0.0.0.0   -e FLASK_RUN_PORT=5001   -e FLASK_DEBUG=false   -e FLASK_SECRET_KEY=local-session-secret   -e JWT_SECRET=local-jwt-secret   request-tracing-lab:local
```

Port mapping:

```text
host port 5001 -> container port 5001
```

Reason for port 5001:

```text
Port 5000 was already used locally, so the container test used 5001.
```

#### 7. Confirm logs go to stdout/stderr

Observed behavior:

```text
Flask startup and request logs appeared in the terminal running the container. This means Docker can collect the application logs without writing application log files inside the container.
```

#### 8. Confirm non-root execution

Dockerfile evidence:

```text
RUN addgroup --system app && adduser --system --ingroup app app
USER app
```

What this proves:

```text
The image is configured to run the application process as the non-root app user.
```

#### 9. Inspect image tags

Command:

```bash
docker images request-tracing-lab
```

Observed output:

```text
IMAGE                       ID             DISK USAGE   CONTENT SIZE   EXTRA
request-tracing-lab:local   a2792a8e07b4   249MB        54.4MB         U
```

Conclusion:

```text
The image exists locally with the expected repository and tag. The tag is a human-readable pointer; the image ID identifies the built image content locally.
```

#### 10. Classify one failure boundary

Example classification:

```text
If docker build fails before an image exists, the failure is build-time.
If the image exists but docker run exits immediately, the failure is container-start.
If the container stays running but /health returns an application error, the failure is application-runtime.
```

### Healthy-Path Verification

Command:

```bash
curl -i http://127.0.0.1:5001/health
```

Observed response:

```http
HTTP/1.1 200 OK
Server: Werkzeug/3.1.8 Python/3.12.13
Date: Fri, 24 Jul 2026 06:50:22 GMT
Content-Type: application/json
Content-Length: 68
X-Request-ID: d1dc6a86-e309-4000-8a86-9d7ddd0b5441
Connection: close
```

Observed body:

```json
{
  "status": "healthy",
  "timestamp": "2026-07-24T06:50:22.500629+00:00"
}
```

Conclusion:

```text
The request reached Flask inside the container and returned a successful JSON response with X-Request-ID preserved.
```

### Controlled Failures

```text
Not yet captured.
```

### Retained Takeaway

```text
An image packages the application. A container runs one process from that image with runtime configuration.
```

## Lab 02: Runtime Configuration, Ports, Processes & Filesystem

### Must Implement Or Inspect

#### 1. Run with container-style environment variables

Command:

```bash
FLASK_RUN_HOST=0.0.0.0 FLASK_RUN_PORT=5001 FLASK_DEBUG=false FLASK_SECRET_KEY=local-session-secret JWT_SECRET=local-jwt-secret python3 app.py
```

Startup evidence:

```text
Serving Flask app 'app'
Debug mode: off
Running on all addresses (0.0.0.0)
Running on http://127.0.0.1:5001
Running on http://10.0.0.11:5001
```

What this proves:

```text
The app accepted runtime configuration from environment variables and listened on 0.0.0.0.
```

#### 2. Confirm listener and host port

Command:

```bash
curl -i http://127.0.0.1:5001/health
```

Observed response:

```http
HTTP/1.1 200 OK
Server: Werkzeug/3.1.8 Python/3.9.6
Date: Fri, 24 Jul 2026 05:39:37 GMT
Content-Type: application/json
Content-Length: 68
X-Request-ID: e4d2e8f2-bb24-4890-a09c-a3f3b521e909
Connection: close
```

Observed body:

```json
{
  "status": "healthy",
  "timestamp": "2026-07-24T05:39:37.201534+00:00"
}
```

#### 3. Correlate request ID with logs

Observed Flask logs:

```text
2026-07-24 01:39:37,201 INFO request_started request_id=e4d2e8f2-bb24-4890-a09c-a3f3b521e909 method=GET path=/health remote_ip=127.0.0.1 user_agent=curl/8.7.1
2026-07-24 01:39:37,202 INFO request_finished request_id=e4d2e8f2-bb24-4890-a09c-a3f3b521e909 status=200
```

What this proves:

```text
The same request ID appeared in the response and server logs, so tracing still works with runtime configuration.
```

#### 4. Investigate a port conflict

Original symptom:

```text
Port 5000 was already in use.
```

Command:

```bash
lsof -i :5000
```

Evidence:

```text
ControlCe was listening on *:commplex-main, which maps to port 5000.
```

Conclusion:

```text
The startup failure was not caused by Flask code. The expected local port was already owned by another process, so FLASK_RUN_PORT=5001 was used.
```

### Controlled Failures

```text
Wrong host binding: Not yet captured.
Wrong host port: Not yet captured.
Missing secret: Not yet captured.
Filesystem write behavior: Not yet captured.
```

### Retained Takeaway

```text
Inside a container, localhost means the container. Bind the app to 0.0.0.0 and make ports, secrets, and writable state explicit at runtime.
```

## Lab 03: Docker Networking, DNS & Container Health

### Must Implement Or Inspect

```text
Not yet captured.
```

### Manual Validation Required

Run the documented lab from [LABS.md](../phases/phase-03-kubernetes-operations-troubleshooting/LABS.md#lab-03-docker-networking-dns--container-health) and capture:

```text
Docker network name:
Container names:
DNS lookup from one container to another:
Internal curl result:
Host curl result:
Health status:
Failure injected:
Evidence:
Conclusion:
```

### Retained Takeaway

```text
Container DNS and health are local runtime evidence. They prove whether containers can find and reach each other before Kubernetes is involved.
```

## Lab 04: Docker Compose Full-Stack Operations

### Must Implement Or Inspect

The Phase 3 Compose stack now exists at:

```text
phases/phase-03-kubernetes-operations-troubleshooting/docker-compose.yml
```

It defines:

```text
nginx -> api -> postgres
              -> redis
```

Supporting files:

```text
phases/phase-03-kubernetes-operations-troubleshooting/docker/nginx.conf
phases/phase-03-kubernetes-operations-troubleshooting/docker/init/002_request_notes.sql
phases/phase-02-tracing-service-boundaries/sql/001_support_tickets.sql
```

### Manual Validation Required

Run:

```bash
cd phases/phase-03-kubernetes-operations-troubleshooting
docker compose up --build
```

Then capture:

```text
Compose services:
NGINX logs:
API logs:
PostgreSQL health:
Redis health:
/health through NGINX:
/notes or support-ticket route through NGINX:
One dependency failure:
Recovery validation:
```

### Retained Takeaway

```text
Compose makes the full local service boundary visible before Kubernetes adds Deployments, Services, EndpointSlices, and probes.
```

## Lab 05: Kubernetes Workloads & Traffic-Path Troubleshooting

### Must Implement Or Inspect

#### 1. Confirm target cluster

Commands:

```bash
kubectl config current-context
minikube status
kubectl get nodes
```

Observed evidence:

```text
current-context: minikube
node: minikube Ready
```

Conclusion:

```text
The intended local Kubernetes target was minikube.
```

#### 2. Validate manifests before applying

Command:

```bash
kubectl apply --dry-run=client -f phases/phase-03-kubernetes-operations-troubleshooting/kubernetes/
```

Local YAML parse check:

```bash
ruby -e 'require "yaml"; ARGV.each { |f| YAML.load_file(f); puts "OK #{f}" }' phases/phase-03-kubernetes-operations-troubleshooting/kubernetes/*.yaml
```

Observed output:

```text
OK phases/phase-03-kubernetes-operations-troubleshooting/kubernetes/deployment.yaml
OK phases/phase-03-kubernetes-operations-troubleshooting/kubernetes/hpa.yaml
OK phases/phase-03-kubernetes-operations-troubleshooting/kubernetes/ingress.yaml
OK phases/phase-03-kubernetes-operations-troubleshooting/kubernetes/namespace.yaml
OK phases/phase-03-kubernetes-operations-troubleshooting/kubernetes/networkpolicy.yaml
OK phases/phase-03-kubernetes-operations-troubleshooting/kubernetes/secret.example.yaml
OK phases/phase-03-kubernetes-operations-troubleshooting/kubernetes/service.yaml
```

Observed dry-run result:

```text
deployment.apps/request-tracing-lab created (dry run)
horizontalpodautoscaler.autoscaling/request-tracing-lab created (dry run)
ingress.networking.k8s.io/request-tracing-lab created (dry run)
namespace/request-tracing-lab created (dry run)
networkpolicy.networking.k8s.io/request-tracing-lab-ingress created (dry run)
secret/request-tracing-lab-secrets created (dry run)
service/request-tracing-lab created (dry run)
```

#### 3. Load local image into minikube

Command:

```bash
minikube image load request-tracing-lab:local
```

What this proves:

```text
The local image is made available to the minikube node so Kubernetes can start Pods from it.
```

#### 4. Apply Kubernetes objects

Commands:

```bash
kubectl apply -f phases/phase-03-kubernetes-operations-troubleshooting/kubernetes/namespace.yaml
kubectl apply -f phases/phase-03-kubernetes-operations-troubleshooting/kubernetes/secret.example.yaml
kubectl apply -f phases/phase-03-kubernetes-operations-troubleshooting/kubernetes/deployment.yaml
kubectl apply -f phases/phase-03-kubernetes-operations-troubleshooting/kubernetes/service.yaml
kubectl apply -f phases/phase-03-kubernetes-operations-troubleshooting/kubernetes/hpa.yaml
kubectl apply -f phases/phase-03-kubernetes-operations-troubleshooting/kubernetes/ingress.yaml
kubectl apply -f phases/phase-03-kubernetes-operations-troubleshooting/kubernetes/networkpolicy.yaml
```

Observed result:

```text
deployment.apps/request-tracing-lab created
service/request-tracing-lab unchanged
horizontalpodautoscaler.autoscaling/request-tracing-lab created
ingress.networking.k8s.io/request-tracing-lab created
networkpolicy.networking.k8s.io/request-tracing-lab-ingress unchanged
```

#### 5. Inspect management path

Commands:

```bash
kubectl get all -n request-tracing-lab
kubectl get pods -n request-tracing-lab -o wide
```

Observed evidence:

```text
pod/request-tracing-lab-5f4994cbbb-2fhq9   1/1   Running   0   21s
pod/request-tracing-lab-5f4994cbbb-xltrj   1/1   Running   0   21s

deployment.apps/request-tracing-lab   2/2   2   2   21s

replicaset.apps/request-tracing-lab-5f4994cbbb   2   2   2   21s
```

Conclusion:

```text
The Deployment created a ReplicaSet, and the ReplicaSet maintained two running Pods.
```

#### 6. Inspect traffic path

Commands:

```bash
kubectl get svc -n request-tracing-lab
kubectl get endpoints -n request-tracing-lab
kubectl get ingress -n request-tracing-lab
```

Service evidence:

```text
service/request-tracing-lab   ClusterIP   10.104.246.0   <none>   80/TCP
```

Endpoint evidence:

```text
request-tracing-lab   10.244.0.3:5001,10.244.0.4:5001
```

Conclusion:

```text
The Service exists and has ready Pod endpoints on container port 5001.
```

#### 7. Test through Service port-forward

Command:

```bash
kubectl port-forward -n request-tracing-lab svc/request-tracing-lab 8080:80
```

Request:

```bash
curl -i http://127.0.0.1:8080/health
```

Observed response:

```http
HTTP/1.1 200 OK
Server: Werkzeug/3.1.8 Python/3.12.13
Date: Fri, 24 Jul 2026 08:11:08 GMT
Content-Type: application/json
Content-Length: 68
X-Request-ID: ee760dae-047d-438e-87bc-bc68436b4f8a
Connection: close
```

Observed body:

```json
{
  "status": "healthy",
  "timestamp": "2026-07-24T08:11:08.363629+00:00"
}
```

Conclusion:

```text
Traffic reached the Flask app through the Kubernetes Service.
```

### Troubleshooting Evidence

Log command:

```bash
kubectl logs -n request-tracing-lab deploy/request-tracing-lab
```

Observed Kubernetes probe log:

```text
request_started request_id=ded40706-aaa2-45db-9b65-d4253aa51f38 method=GET path=/health remote_ip=10.244.0.1 user_agent=kube-probe/1.35
request_finished request_id=ded40706-aaa2-45db-9b65-d4253aa51f38 status=200
```

What this proves:

```text
Kubernetes readiness/liveness probes are reaching /health successfully. The kube-probe user agent identifies health-check traffic, not browser or curl traffic.
```

### Retained Takeaway

```text
Kubernetes has two different paths to inspect: management creates Pods; traffic reaches only ready Pods through Service and EndpointSlice routing.
```

## Lab 06: Readiness, Dependencies, DNS, Config & Resource Failures

### Must Implement Or Inspect

Configuration now exists in:

```text
phases/phase-03-kubernetes-operations-troubleshooting/kubernetes/configmap.yaml
phases/phase-03-kubernetes-operations-troubleshooting/kubernetes/secret.example.yaml
phases/phase-03-kubernetes-operations-troubleshooting/kubernetes/deployment.yaml
```

The Deployment references:

```text
envFrom ConfigMap: request-tracing-lab-config
Secret: request-tracing-lab-secrets
DATABASE_URL from Secret because the local example includes database credentials
Readiness probe: /health on named port http
Liveness probe: /health on named port http
Requests: cpu 100m, memory 128Mi
Limits: cpu 500m, memory 256Mi
```

Recorded readiness evidence from Lab 05:

```text
request_started request_id=ded40706-aaa2-45db-9b65-d4253aa51f38 method=GET path=/health remote_ip=10.244.0.1 user_agent=kube-probe/1.35
request_finished request_id=ded40706-aaa2-45db-9b65-d4253aa51f38 status=200
```

What this proves:

```text
At the time captured, Kubernetes probes could reach /health and the application returned 200.
```

### Remaining Manual Validation

Capture these failure modes by following Lab 06 in [LABS.md](../phases/phase-03-kubernetes-operations-troubleshooting/LABS.md#lab-06-readiness-dependencies-dns-config--resource-failures):

```text
Bad readiness path:
Bad ConfigMap or Secret reference:
Bad REDIS_URL or DATABASE_URL:
DNS lookup failure from inside the Pod:
Resource request causing Pending:
Recovery validation:
```

### Retained Takeaway

```text
A running Pod is not automatically useful. Readiness, runtime configuration, DNS, resources, and dependencies decide whether it can serve real traffic.
```

## Lab 07: Rollouts, Releases, Rollback & Persistent State

### Must Implement Or Inspect

```text
Not yet captured.
```

### Manual Validation Required

Run the documented rollout lab and capture:

```text
Initial image or config:
Rollout command:
rollout status:
ReplicaSet before and after:
Failure injected:
Rollback command:
Post-rollback validation:
PostgreSQL persistence check:
What changed safely:
What should not be rolled back casually:
```

### Retained Takeaway

```text
Rollbacks can recover stateless app behavior quickly, but persistent data and schema changes need separate evidence and care.
```

## Lab 08: Helm, Complex Incident, Runbook & Diagnostic Automation

### Must Implement Or Inspect

Phase 3 now includes:

```text
phases/phase-03-kubernetes-operations-troubleshooting/helm/request-tracing-lab/
phases/phase-03-kubernetes-operations-troubleshooting/scripts/diagnose-service-routing.sh
phases/phase-03-kubernetes-operations-troubleshooting/runbooks/
```

Diagnostic helper purpose:

```text
Collect Service selector, matching Pods, readiness, EndpointSlices, Service ports, targetPort, container ports, and recent events. It does not generate a root-cause conclusion.
```

### Manual Validation Required

Run:

```bash
phases/phase-03-kubernetes-operations-troubleshooting/scripts/diagnose-service-routing.sh request-tracing-lab request-tracing-lab
```

If Helm is installed, run:

```bash
helm lint phases/phase-03-kubernetes-operations-troubleshooting/helm/request-tracing-lab
helm template request-tracing-lab phases/phase-03-kubernetes-operations-troubleshooting/helm/request-tracing-lab
```

Capture:

```text
Runbook used:
Symptom:
Expected request path:
Known-good boundaries:
First failed boundary:
Diagnostic helper output:
Helm rendered evidence:
Root cause:
Fix or mitigation:
Validation:
Prevention note:
```

### Retained Takeaway

```text
A useful troubleshooting tool gathers boundary evidence quickly, but the operator still owns the reasoning and final conclusion.
```
