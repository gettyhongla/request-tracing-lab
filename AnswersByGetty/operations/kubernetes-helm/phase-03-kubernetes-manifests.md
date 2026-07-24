# Phase 3: Deploy with Kubernetes Manifests

## Goal

Move from a local container to Kubernetes objects that can run, expose, inspect, and troubleshoot the Flask application.

## Safety Check

Before applying manifests, confirm the intended target:

```bash
kubectl config current-context
kubectl get nodes
```

For local practice, use a local cluster such as Docker Desktop Kubernetes, kind, or minikube.

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

## Request Flow

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

## Step 1: Create Kubernetes Manifests

Created:

```text
k8s/
|-- namespace.yaml
|-- secret.example.yaml
|-- deployment.yaml
|-- service.yaml
|-- ingress.yaml
|-- hpa.yaml
|-- networkpolicy.yaml
```

## Step 2: Check the Manifests Before Applying

Command:

```bash
kubectl apply --dry-run=client -f k8s/
```

Purpose:

```text
Validate the YAML shape locally before creating objects in a cluster.
```

Local YAML parse check:

```bash
ruby -e 'require "yaml"; ARGV.each { |f| YAML.load_file(f); puts "OK #{f}" }' k8s/*.yaml
```

Result:

```text
OK k8s/deployment.yaml
OK k8s/hpa.yaml
OK k8s/ingress.yaml
OK k8s/namespace.yaml
OK k8s/networkpolicy.yaml
OK k8s/secret.example.yaml
OK k8s/service.yaml
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
Copy my local Docker image into minikube so Kubernetes can run it.
```

Why this is needed:

```text
The image request-tracing-lab:local exists in Docker on the laptop.
Minikube runs its own Kubernetes node.
That node needs access to the image before it can start Pods from it.
```

Then run the dry-run validation again:

```bash
kubectl apply --dry-run=client -f k8s/
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

## Step 3: Apply to the Intended Cluster

Apply the manifests in a clear order so the namespace and secret exist before the app resources that depend on them:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.example.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/networkpolicy.yaml
```

Apply result:

```text
deployment.apps/request-tracing-lab created
service/request-tracing-lab unchanged
horizontalpodautoscaler.autoscaling/request-tracing-lab created
ingress.networking.k8s.io/request-tracing-lab created
networkpolicy.networking.k8s.io/request-tracing-lab-ingress unchanged
```

## How The Kubernetes Objects Fit Together

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

## Step 4: Inspect the Deployment

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

## Step 5: Test the Service With Port Forwarding

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
The request ID lets me separate my curl request from Kubernetes probe traffic.
```

## Record

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

## Key Takeaways

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
For an app moving toward production, I would confirm image availability, runtime config, secrets, probes, resource requests/limits, scaling behavior, service routing, logs, and clear rollback/deployment ownership with the developer.
```
