# Phase 3 Answers

This document records completed Phase 3 container and Kubernetes evidence, conclusions, and retained takeaways.

## Recorded Labs

| Lab | Topic | Status |
| --- | --- | --- |
| [Lab 01](#lab-01-containerize-the-system) | Containerize the system | Recorded |
| [Lab 02](#lab-02-configuration-and-secrets) | Configuration and secrets | Recorded |
| [Lab 03](../phases/phase-03-operating-a-production-service/LABS.md#lab-03-observability) | Observability | Not yet recorded |
| [Lab 04](../phases/phase-03-operating-a-production-service/LABS.md#lab-04-alerting-and-supportability) | Alerting and supportability | Not yet recorded |
| [Lab 05](../phases/phase-03-operating-a-production-service/LABS.md#lab-05-deployment-verification) | Deployment verification | Not yet recorded |
| [Lab 06](../phases/phase-03-operating-a-production-service/LABS.md#lab-06-rollback-and-release-safety) | Rollback and release safety | Not yet recorded |
| [Lab 07](#lab-07-kubernetes-migration) | Kubernetes migration | Recorded out of order |
| [Lab 08](../phases/phase-03-operating-a-production-service/LABS.md#lab-08-production-incident) | Production incident | Not yet recorded |

## Study Gaps To Return To

```text
Lab 03: preserve request IDs, logs, metrics, and traces inside containers.
Lab 04: define alerts, triage steps, and support escalation evidence.
Lab 05: prove deployments before and after traffic reaches the service.
Lab 06: practice rollback versus roll-forward decisions.
Lab 08: investigate one realistic production incident and write an RCA.
```

## Lab 01: Containerize The System

### Goal

Package the Flask app into a Docker image, run it as a container, and prove that the containerized app still handles requests correctly.

### Request Flow

```text
curl on laptop
  |
  v
127.0.0.1:5001 on host
  |
  v
Docker port mapping
  |
  v
5001 inside container
  |
  v
Flask app
  |
  v
/health
  |
  v
JSON response with X-Request-ID
```

### Step 1: Create the Dockerfile

Created:

```text
request-tracing-lab/
|-- Dockerfile
```

The `Dockerfile` is the image blueprint. It shows how the app becomes a runnable container image.

It covers:

```text
Python base image
Working directory
requirements.txt dependency install
app.py copy
container-friendly environment variables
non-root runtime user
port 5001
/health health check
python app.py startup command
```

### Step 2: Create the .dockerignore

Created:

```text
request-tracing-lab/
|-- .dockerignore
```

The `.dockerignore` prevents local-only files from being copied into the Docker build context.

Ignored files:

```gitignore
venv/
.venv/
__pycache__/
**/__pycache__/
*.py[cod]
.git/
.DS_Store
.env
*.pem
*.key
cookies.txt
```

### Step 3: Build the Image

Command:

```bash
docker build -t request-tracing-lab:local .
```

Build result:

```text
Successful
```

Build evidence:

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

Any warnings:

```text
No blocking warnings captured in this build output.
```

What this proves:

```text
Docker found the Dockerfile and .dockerignore, used the current directory as the build context, installed the app dependencies, copied app.py, and created the local image request-tracing-lab:local.
```

### Step 4: Inspect the Image

Command:

```bash
docker images request-tracing-lab
```

Output:

```text
IMAGE                       ID             DISK USAGE   CONTENT SIZE   EXTRA
request-tracing-lab:local   a2792a8e07b4   249MB        54.4MB         U
```

What this proves:

```text
The image exists locally with the expected name and tag.
```

### Step 5: Run the Container

Command:

```bash
docker run --rm \
  -p 5001:5001 \
  -e FLASK_RUN_HOST=0.0.0.0 \
  -e FLASK_RUN_PORT=5001 \
  -e FLASK_DEBUG=false \
  -e FLASK_SECRET_KEY=local-session-secret \
  -e JWT_SECRET=local-jwt-secret \
  request-tracing-lab:local
```

Port mapping:

```text
host port 5001 -> container port 5001
```

Why port `5001`:

```text
Port 5000 was already used by macOS, so the container test used 5001.
```

### Step 6: Test the Container

Command:

```bash
curl -i http://127.0.0.1:5001/health
```

Response headers:

```http
HTTP/1.1 200 OK
Server: Werkzeug/3.1.8 Python/3.12.13
Date: Fri, 24 Jul 2026 06:50:22 GMT
Content-Type: application/json
Content-Length: 68
X-Request-ID: d1dc6a86-e309-4000-8a86-9d7ddd0b5441
Connection: close
```

Response body:

```json
{
  "status": "healthy",
  "timestamp": "2026-07-24T06:50:22.500629+00:00"
}
```

What this proves:

```text
The request reached the Flask app running inside the container. The app returned a successful JSON response and included X-Request-ID, so request tracing still works after packaging.
```

### Evidence Summary

```text
Dockerfile created:
Yes

.dockerignore created:
Yes

Build command:
docker build -t request-tracing-lab:local .

Image name and tag:
request-tracing-lab:local

Image inspection command:
docker images request-tracing-lab

Image ID:
a2792a8e07b4

Disk usage:
249MB

Content size:
54.4MB

Run command:
docker run --rm -p 5001:5001 ... request-tracing-lab:local

Host port:
5001

Container port:
5001

curl command:
curl -i http://127.0.0.1:5001/health

Response status:
HTTP/1.1 200 OK

X-Request-ID:
d1dc6a86-e309-4000-8a86-9d7ddd0b5441
```

### Troubleshooting Prompts

What happens if the app binds to `127.0.0.1` inside the container?

```text
The app may only listen on the container's loopback interface.

Result:
The Flask process can answer requests from inside the container, but traffic forwarded from Docker or Kubernetes may not reach it.

Fix:
Bind the app to 0.0.0.0 inside the container.
```

What happens if the host port is mapped incorrectly?

```text
The container may be running correctly, but the laptop request goes to the wrong host port.

Example:
If the container is started with -p 5002:5001, then this will fail:
curl http://127.0.0.1:5001/health

The correct test would be:
curl http://127.0.0.1:5002/health
```

How do you inspect container logs?

```bash
docker ps
docker logs <container-id-or-name>
```

For this lab, the app writes logs to stdout/stderr, so `docker logs` should show the same Flask request logs that appeared when running `python app.py` locally.

How do you verify the container is listening on the expected port?

```bash
docker ps
docker port <container-id-or-name>
curl -i http://127.0.0.1:5001/health
```

What to prove:

```text
docker ps shows the port mapping.
docker port shows host port -> container port.
curl proves the mapped port reaches the Flask /health route.
```

How would you keep secrets out of the image?

```text
Do not hard-code secrets in app.py.
Do not put secrets in the Dockerfile.
Do not copy .env, keys, certificates, or cookies into the image.
Use runtime environment variables for local testing.
Use Kubernetes Secrets or a secret manager in Kubernetes-style environments.
```

### Key Takeaways

```text
Build context:
The dot in docker build -t request-tracing-lab:local . tells Docker to use the current directory as the build context.

Dockerfile:
The Dockerfile must exist in the build context unless another file is specified with -f.

.dockerignore:
.dockerignore keeps local-only files, caches, Git history, secrets, and generated files out of the build context.

Port mapping:
-p 5001:5001 maps laptop port 5001 to container port 5001.

Runtime config:
The container image is reusable because host, port, debug mode, and secrets are supplied at runtime with environment variables.

Tracing:
The same /health endpoint and X-Request-ID behavior worked after packaging, proving the request-tracing behavior survived the move into a container.
```

## Lab 02: Configuration And Secrets

### Goal

Confirm the Flask app can run locally with container-style runtime settings before building a Docker image.

This phase proves:

```text
The app starts successfully.
The app can read environment variables.
The app can listen on 0.0.0.0.
The health endpoint still works.
Logs still print to the terminal.
X-Request-ID still appears in responses and logs.
```

### Why This Phase Matters

Before building an image, the app should already behave the way it needs to behave inside a container.

Container runtime behavior means:

```text
The app starts from a runtime command.
Settings come from environment variables.
Secrets are injected at runtime.
The app listens on an address reachable inside its network environment.
Logs go to stdout/stderr.
```

If this fails locally, Docker and Kubernetes will add more layers to troubleshoot.

### Request Flow

```text
curl on laptop
  |
  v
127.0.0.1:5001
  |
  v
Flask process listening on 0.0.0.0:5001
  |
  v
/health
  |
  v
JSON response with X-Request-ID
```

### Step 1: Run With Local Defaults

Command:

```bash
python app.py
```

Test:

```bash
curl -i http://127.0.0.1:5000/health
```

Expected result:

```text
HTTP status is 200.
Response body says the app is healthy.
Response headers include X-Request-ID.
Flask logs show request_started and request_finished.
```

### Step 2: Run With Container-Style Runtime Settings

Port `5000` was already in use on this machine, so the app was started on port `5001`.

Command:

```bash
FLASK_RUN_HOST=0.0.0.0 \
FLASK_RUN_PORT=5001 \
FLASK_DEBUG=false \
FLASK_SECRET_KEY=local-session-secret \
JWT_SECRET=local-jwt-secret \
python3 app.py
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
The app accepted runtime configuration from environment variables and listened on 0.0.0.0 instead of only 127.0.0.1.
```

### Step 3: Test The Health Endpoint

Command:

```bash
curl -i http://127.0.0.1:5001/health
```

Response headers:

```http
HTTP/1.1 200 OK
Server: Werkzeug/3.1.8 Python/3.9.6
Date: Fri, 24 Jul 2026 05:39:37 GMT
Content-Type: application/json
Content-Length: 68
X-Request-ID: e4d2e8f2-bb24-4890-a09c-a3f3b521e909
Connection: close
```

Response body:

```json
{
  "status": "healthy",
  "timestamp": "2026-07-24T05:39:37.201534+00:00"
}
```

Matching Flask logs:

```text
2026-07-24 01:39:37,201 INFO request_started request_id=e4d2e8f2-bb24-4890-a09c-a3f3b521e909 method=GET path=/health remote_ip=127.0.0.1 user_agent=curl/8.7.1
2026-07-24 01:39:37,202 INFO request_finished request_id=e4d2e8f2-bb24-4890-a09c-a3f3b521e909 status=200
```

What this proves:

```text
The Flask app responded successfully with runtime env vars, returned X-Request-ID, and logged the same request ID with method, path, and status.
```

### Step 4: Troubleshoot Port 5000

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
The startup failure was not caused by Flask code. Port 5000 was already owned by a macOS system process, so `FLASK_RUN_PORT=5001` was used.
```

Why this matters:

```text
Port conflicts are common operations problems. In Docker or Kubernetes, a similar symptom can come from the wrong container port, wrong service targetPort, or another process already listening on the expected port.
```

### Runtime Settings

```text
FLASK_RUN_HOST: Controls which network address Flask listens on.
FLASK_RUN_PORT: Controls which port Flask listens on.
FLASK_DEBUG: Controls debug behavior. Use false outside local development.
FLASK_SECRET_KEY: Signs Flask session cookies. Use a real secret in production.
JWT_SECRET: Signs JWTs. Use a real secret in production.
```

### Key Takeaways

```text
Network namespace:
A container has its own network environment. Its localhost is not the same thing as the laptop's localhost.

Loopback:
127.0.0.1 means "this same network environment." On a laptop, it means the laptop. Inside a container, it means the container.

Binding:
Binding to 0.0.0.0 does not create a network namespace. It tells the app to listen on all available interfaces inside the current network environment.

Container traffic:
Traffic from outside the container needs the app to listen on an address reachable from the container network interface.

Runtime config:
Environment variables let the same code run in different environments without editing source code.

Reusability:
The image should contain the app, not environment-specific settings or secrets.

Debug mode:
FLASK_DEBUG=false is safer outside local development because detailed errors should go to logs and monitoring, not directly to users.

Port troubleshooting:
When the app cannot start, check whether the expected port is already in use before assuming the application code is broken.
```

## Lab 07: Kubernetes Migration

### Goal

Move from a local container to Kubernetes objects that can run, expose, inspect, and troubleshoot the Flask application.

### Safety Check

Before applying manifests, confirm the intended target:

```bash
kubectl config current-context
kubectl get nodes
```

For local validation, use a local cluster such as Docker Desktop Kubernetes, kind, or minikube.

Local cluster setup:

```bash
minikube start
```

Current local cluster evidence:

```bash
kubectl config current-context
minikube status
kubectl get nodes
```

Result:

```text
current-context: minikube
node: minikube Ready
```

### Request Flow

```text
curl or browser
  |
  v
Ingress, if available
  |
  v
Service: request-tracing-lab:80
  |
  v
EndpointSlice / Pod IPs
  |
  v
Pod replica
  |
  v
Container port 5001
  |
  v
Flask /health
  |
  v
JSON response with X-Request-ID
```

### Step 1: Create Kubernetes Manifests

Created:

```text
phases/phase-03-operating-a-production-service/kubernetes/
|-- namespace.yaml
|-- secret.example.yaml
|-- deployment.yaml
|-- service.yaml
|-- ingress.yaml
|-- hpa.yaml
|-- networkpolicy.yaml
```

### Step 2: Check the Manifests Before Applying

Command:

```bash
kubectl apply --dry-run=client -f phases/phase-03-operating-a-production-service/kubernetes/
```

Purpose:

```text
Validate the YAML shape locally before creating objects in a cluster.
```

Local YAML parse check:

```bash
ruby -e 'require "yaml"; ARGV.each { |f| YAML.load_file(f); puts "OK #{f}" }' phases/phase-03-operating-a-production-service/kubernetes/*.yaml
```

Result:

```text
OK phases/phase-03-operating-a-production-service/kubernetes/deployment.yaml
OK phases/phase-03-operating-a-production-service/kubernetes/hpa.yaml
OK phases/phase-03-operating-a-production-service/kubernetes/ingress.yaml
OK phases/phase-03-operating-a-production-service/kubernetes/namespace.yaml
OK phases/phase-03-operating-a-production-service/kubernetes/networkpolicy.yaml
OK phases/phase-03-operating-a-production-service/kubernetes/secret.example.yaml
OK phases/phase-03-operating-a-production-service/kubernetes/service.yaml
```

What this proves:

```text
The YAML files are syntactically readable.
```

Before deploying, load the local image into the minikube node:

```bash
minikube image load request-tracing-lab:local
```

Meaning:

```text
Copy the local Docker image into minikube so Kubernetes can run it.
```

Why this is needed:

```text
The image request-tracing-lab:local exists in Docker on the laptop.
Minikube runs its own Kubernetes node.
That node needs access to the image before it can start Pods from it.
```

Then run the dry-run validation again:

```bash
kubectl apply --dry-run=client -f phases/phase-03-operating-a-production-service/kubernetes/
```

Result:

```text
deployment.apps/request-tracing-lab created (dry run)
horizontalpodautoscaler.autoscaling/request-tracing-lab created (dry run)
ingress.networking.k8s.io/request-tracing-lab created (dry run)
namespace/request-tracing-lab created (dry run)
networkpolicy.networking.k8s.io/request-tracing-lab-ingress created (dry run)
secret/request-tracing-lab-secrets created (dry run)
service/request-tracing-lab created (dry run)
```

What this proves:

```text
The Kubernetes API accepted the manifest shapes in dry-run mode.
No Kubernetes resources were created yet.
```

### Step 3: Apply to the Intended Cluster

Apply the manifests in a clear order so the namespace and secret exist before the app resources that depend on them:

```bash
kubectl apply -f phases/phase-03-operating-a-production-service/kubernetes/namespace.yaml
kubectl apply -f phases/phase-03-operating-a-production-service/kubernetes/secret.example.yaml
kubectl apply -f phases/phase-03-operating-a-production-service/kubernetes/deployment.yaml
kubectl apply -f phases/phase-03-operating-a-production-service/kubernetes/service.yaml
kubectl apply -f phases/phase-03-operating-a-production-service/kubernetes/hpa.yaml
kubectl apply -f phases/phase-03-operating-a-production-service/kubernetes/ingress.yaml
kubectl apply -f phases/phase-03-operating-a-production-service/kubernetes/networkpolicy.yaml
```

Apply result:

```text
deployment.apps/request-tracing-lab created
service/request-tracing-lab unchanged
horizontalpodautoscaler.autoscaling/request-tracing-lab created
ingress.networking.k8s.io/request-tracing-lab created
networkpolicy.networking.k8s.io/request-tracing-lab-ingress unchanged
```

### How The Kubernetes Objects Fit Together

```text
Namespace:
Holds the lab resources in a separate workspace named request-tracing-lab.

Secret:
Stores FLASK_SECRET_KEY and JWT_SECRET so they are provided at runtime, not baked into the image.

Deployment:
Declares that Kubernetes should run 2 replicas of the Flask app container.

Pod:
The actual running unit created by the Deployment. Each Pod contains the Flask container.

Readiness probe:
Calls /health to decide whether a Pod is ready to receive traffic.

Liveness probe:
Calls /health to decide whether Kubernetes should restart the container.

Service:
Gives the Pods one stable internal name and IP. It sends Service port 80 to container port 5001.

EndpointSlice / Endpoints:
Shows which ready Pod IPs are currently behind the Service.

Ingress:
Optional external HTTP routing layer. It sends host/path traffic to the Service.

HPA:
Watches CPU metrics and can scale the Deployment from 2 to 5 replicas.
```

### Step 4: Inspect the Deployment

Commands:

```bash
kubectl get all -n request-tracing-lab
kubectl get pods -n request-tracing-lab -o wide
kubectl get svc -n request-tracing-lab
kubectl get endpoints -n request-tracing-lab
kubectl get hpa -n request-tracing-lab
kubectl get ingress -n request-tracing-lab
kubectl get events -n request-tracing-lab --sort-by=.lastTimestamp
```

Deployment evidence:

```text
pod/request-tracing-lab-5f4994cbbb-2fhq9   1/1   Running   0   21s
pod/request-tracing-lab-5f4994cbbb-xltrj   1/1   Running   0   21s

deployment.apps/request-tracing-lab   2/2   2   2   21s

replicaset.apps/request-tracing-lab-5f4994cbbb   2   2   2   21s
```

Service evidence:

```text
service/request-tracing-lab   ClusterIP   10.104.246.0   <none>   80/TCP
```

Endpoint evidence:

```text
request-tracing-lab   10.244.0.3:5001,10.244.0.4:5001
```

HPA evidence:

```text
horizontalpodautoscaler.autoscaling/request-tracing-lab
REFERENCE: Deployment/request-tracing-lab
TARGETS: cpu: <unknown>/70%
MINPODS: 2
MAXPODS: 5
REPLICAS: 2
```

What this proves:

```text
The Deployment created 2 running Pods.
The ReplicaSet is maintaining the requested replica count.
The Service exists and has ready Pod endpoints.
The Service routes traffic to container port 5001.
The HPA exists, but CPU metrics are not available yet.
```

### Step 5: Test the Service With Port Forwarding

Use this if Ingress is not available:

```bash
kubectl port-forward -n request-tracing-lab svc/request-tracing-lab 8080:80
```

In another terminal:

```bash
curl -i http://127.0.0.1:8080/health
```

Expected result:

```text
HTTP/1.1 200 OK
X-Request-ID is present
Response body reports status healthy
Matching Flask request log appears in kubectl logs
```

Successful curl evidence:

```http
HTTP/1.1 200 OK
Server: Werkzeug/3.1.8 Python/3.12.13
Date: Fri, 24 Jul 2026 08:11:08 GMT
Content-Type: application/json
Content-Length: 68
X-Request-ID: ee760dae-047d-438e-87bc-bc68436b4f8a
Connection: close
```

Response body:

```json
{
  "status": "healthy",
  "timestamp": "2026-07-24T08:11:08.363629+00:00"
}
```

Log command:

```bash
kubectl logs -n request-tracing-lab deploy/request-tracing-lab
```

Observed log evidence:

```text
request_started request_id=ded40706-aaa2-45db-9b65-d4253aa51f38 method=GET path=/health remote_ip=10.244.0.1 user_agent=kube-probe/1.35
request_finished request_id=ded40706-aaa2-45db-9b65-d4253aa51f38 status=200
```

What this proves:

```text
Kubernetes readiness/liveness probes are reaching /health successfully.
The user_agent kube-probe/1.35 identifies Kubernetes health-check traffic, not browser or curl user traffic.
```

To find a specific curl request ID:

```bash
kubectl logs -n request-tracing-lab deploy/request-tracing-lab | grep ee760dae-047d-438e-87bc-bc68436b4f8a
```

If the Deployment log command does not show it, inspect each Pod:

```bash
kubectl get pods -n request-tracing-lab
kubectl logs -n request-tracing-lab pod/<pod-name> | grep ee760dae-047d-438e-87bc-bc68436b4f8a
```

Why:

```text
The Service can send different requests to different Pod replicas.
The request ID separates the curl request from Kubernetes probe traffic.
```

### Record

```text
Namespace:
request-tracing-lab

Deployment name:
request-tracing-lab

Replica count:
2 desired, 2 current, 2 ready

Pod status:
Two Pods Running and Ready:
request-tracing-lab-5f4994cbbb-2fhq9
request-tracing-lab-5f4994cbbb-xltrj

Service name:
request-tracing-lab

Service selector:
app.kubernetes.io/name=request-tracing-lab

Endpoints present:
Yes:
10.244.0.3:5001
10.244.0.4:5001

Ingress host:
request-tracing-lab.local

Readiness probe:
/health on named port http

Liveness probe:
/health on named port http

Request ID test:
curl returned X-Request-ID ee760dae-047d-438e-87bc-bc68436b4f8a

Matching app log:
Kubernetes probe logs were confirmed with user_agent=kube-probe/1.35 and status=200.
Specific curl request ID can be found with kubectl logs and grep across the Deployment or individual Pods.
```

### Key Takeaways

```text
Context safety:
Always confirm kubectl config current-context before applying manifests. The intended lab target was minikube, not EKS.

Local image loading:
minikube image load request-tracing-lab:local copies the local Docker image into the minikube node so Kubernetes can start Pods from it.

Apply order:
Namespaces should exist before namespaced resources such as Deployments, Services, HPAs, Ingresses, and NetworkPolicies.

Deployment:
Creates and maintains the desired number of Pods.

Pod:
Runs the containerized Flask app.

Service:
Gives the Pods a stable internal address and routes port 80 to container port 5001.

EndpointSlice / Endpoints:
Shows whether the Service has ready Pods behind it. No endpoints means Service traffic has nowhere useful to go.

Readiness probe:
Controls whether a Pod should receive traffic.

Liveness probe:
Controls whether Kubernetes should restart a stuck or unhealthy container.

Secret:
Provides runtime values such as FLASK_SECRET_KEY and JWT_SECRET without baking them into the image.

Ingress:
Routes external HTTP traffic to the Service when an ingress controller exists.

HPA:
Defines scaling intent from 2 to 5 replicas. cpu: <unknown>/70% means metrics are not available yet, not that the app failed.

Operational evidence:
Use Pods, Deployments, Services, Endpoints, Events, HPA, curl, and logs together. One command rarely tells the whole story.

Production framing:
For an app moving toward production, confirm image availability, runtime config, secrets, probes, resource requests/limits, scaling behavior, service routing, logs, and clear rollback/deployment ownership with the developer.
```
