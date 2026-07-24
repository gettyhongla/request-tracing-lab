# Kubernetes Operator Concepts

This guide explains the Kubernetes objects used in this project from an operator's point of view: what each layer does, why it exists, what can fail there, and what evidence to collect.

The goal is not to memorize YAML. The goal is to understand how Kubernetes keeps an application running and how to reason through failures by layer.

## The Operator Mental Model

Kubernetes is a desired-state system.

```text
You declare what should exist.
Kubernetes watches what actually exists.
Controllers keep trying to move actual state toward desired state.
```

Examples:

```text
Deployment says: I want 2 Pods.
ReplicaSet says: I will maintain those 2 Pods.
Kubelet says: I will run containers on this node.
Service says: I will route to ready Pods matching this selector.
HPA says: I will adjust replica count when metrics cross a threshold.
```

This is why Kubernetes is often described as self-healing. It has controllers that continuously reconcile drift.

## Start With The Symptom

For a web app, do not jump straight into Kubernetes every time.

Start with the user-visible symptom:

```text
Did the page load?
Did the API request fail?
What HTTP status came back?
Which URL failed?
Which layer returned the error?
```

Browser DevTools can immediately show:

```text
Request URL
Request method
Response status
Response headers
Response body
Which frontend file or API call triggered the request
Whether the browser saw a network failure, 401, 404, 405, 500, 502, CORS error, or TLS error
```

Then move into Kubernetes with a sharper question.

Example:

```text
DevTools shows 502 from nginx.
Now inspect the frontend/proxy Pod logs, Service, and Endpoints.
```

## Layered Troubleshooting Flow

Use this order when the failure begins in a browser or client:

```text
Client evidence:
Browser DevTools or curl

Entry layer:
Ingress, gateway, nginx, or port-forward

Routing layer:
Service and Endpoints / EndpointSlices

Workload layer:
Deployment, ReplicaSet, Pods

Runtime layer:
Container logs, probes, environment variables, image, resources

Application layer:
Routes, auth, request IDs, response bodies, exceptions
```

The point is not to follow this rigidly. The point is to always know which layer you are testing.

## Deployment

A Deployment declares how many copies of an application should run and what container image/config those copies should use. 

In this project:

```yaml
kind: Deployment
spec:
  replicas: 2
```

Meaning:

```text
Keep 2 replicas of this app running. If one Pod disappears, create another one.
```

Why it matters:

```text
Deployments provide rollout management and self-healing through ReplicaSets.
They are usually the main object operators inspect for application health.
```

Evidence:

```bash
kubectl get deploy -n request-tracing-lab
kubectl describe deploy request-tracing-lab -n request-tracing-lab
```

Look for:

```text
READY 2/2
AVAILABLE 2
Recent rollout or replica errors
```

## ReplicaSet

A ReplicaSet is created by the Deployment. It maintains the requested number of matching Pods.
You usually do not edit ReplicaSets directly.

Mental model:

```text
Deployment = rollout and desired app version
ReplicaSet = keeps the right number of Pods alive
Pod = actual running workload
```

Evidence:

```bash
kubectl get rs -n request-tracing-lab
```

Look for:

```text
DESIRED 2
CURRENT 2
READY 2
```

## Pod

A Pod is the smallest deployable unit in Kubernetes. In this project, each Pod runs one Flask container.

Why it matters:

```text
The Pod is where the application actually runs.
If the Pod is not Running and Ready, the Service cannot send useful traffic to it.
```

Evidence:

```bash
kubectl get pods -n request-tracing-lab -o wide
kubectl describe pod -n request-tracing-lab <pod-name>
kubectl logs -n request-tracing-lab <pod-name>
```

Look for:

```text
STATUS Running
READY 1/1
RESTARTS 0
Pod IP
Node name
Events
Probe failures
Image pull errors
CrashLoopBackOff
```

## Readiness Probe

A readiness probe answers this question:

```text
Should this Pod receive traffic right now?
```

In this project:

```yaml
readinessProbe:
  httpGet:
    path: /health
    port: http
```

If readiness fails:

```text
The Pod may still be running.
Kubernetes removes it from Service endpoints.
The Service stops routing traffic to it.
```

Why it matters:

```text
Readiness protects users from Pods that are alive but not ready to serve requests.
```

Evidence:

```bash
kubectl describe pod -n request-tracing-lab <pod-name>
kubectl get endpoints -n request-tracing-lab
```

Look for:

```text
Readiness probe failed
Pod READY 0/1
Missing Pod IP in endpoints
```

## Liveness Probe

A liveness probe answers this question:

```text
Should Kubernetes restart this container?
```

If liveness fails repeatedly:

```text
Kubernetes restarts the container.
The Pod restart count increases.
```

Why it matters:

```text
Liveness helps recover from stuck application processes.
It should not be too aggressive, or Kubernetes may restart healthy but slow apps.
```

Evidence:

```bash
kubectl get pods -n request-tracing-lab
kubectl describe pod -n request-tracing-lab <pod-name>
```

Look for:

```text
RESTARTS increasing
Liveness probe failed
Killing container
```

## Service

A Service gives a stable network identity to a changing set of Pods.

Pods are replaceable. Pod IPs can change. A Service gives clients one stable address.

In this project:

```yaml
kind: Service
spec:
  type: ClusterIP
  selector:
    app.kubernetes.io/name: request-tracing-lab
  ports:
    - port: 80
      targetPort: http
```

Meaning:

```text
Create an internal cluster address on port 80.
Find Pods with label app.kubernetes.io/name=request-tracing-lab.
Forward traffic to their named port http, which maps to container port 5001.
```

Why it matters:

```text
Services decouple clients from individual Pods.
If Pods are replaced, the Service can keep routing to the new ready Pods.
```

Evidence:

```bash
kubectl get svc -n request-tracing-lab
kubectl describe svc request-tracing-lab -n request-tracing-lab
```

Look for:

```text
TYPE ClusterIP
PORT 80/TCP
Selector matches the Pod labels
```

## Endpoints And EndpointSlices

Endpoints show the ready Pod IPs behind a Service.

If a Service exists but has no endpoints, traffic has nowhere useful to go.

In this project, healthy evidence looked like:

```text
10.244.0.3:5001,10.244.0.4:5001
```

Meaning:

```text
The Service has two ready Pod backends.
Traffic to Service port 80 can route to Pods on port 5001.
```

Why it matters:

```text
Endpoints are one of the fastest ways to prove whether Service routing is connected to real Pods.
```

Evidence:

```bash
kubectl get endpoints -n request-tracing-lab
kubectl get endpointslice -n request-tracing-lab
```

Look for:

```text
Endpoint IPs and ports exist
Endpoint ports match the app container port
No endpoints means selector mismatch, Pods not ready, or Pods missing
```

## Ingress

Ingress defines HTTP routing from outside the cluster to a Service.

Ingress by itself is a rule. An ingress controller, such as nginx, must exist to implement the rule.

In this project:

```yaml
kind: Ingress
spec:
  ingressClassName: nginx
  rules:
    - host: request-tracing-lab.local
      http:
        paths:
          - path: /
            backend:
              service:
                name: request-tracing-lab
                port:
                  number: 80
```

Meaning:

```text
HTTP traffic for request-tracing-lab.local/ should route to the request-tracing-lab Service on port 80.
```

Why it matters:

```text
Ingress is where host/path routing, TLS termination, and edge HTTP behavior often enter the system.
```

Evidence:

```bash
kubectl get ingress -n request-tracing-lab
kubectl describe ingress request-tracing-lab -n request-tracing-lab
```

Look for:

```text
Correct host
Correct path
Correct backend Service and port
Ingress controller exists
TLS configuration, if enabled
```

## HPA

HPA means HorizontalPodAutoscaler.

It changes the replica count based on metrics.

In this project:

```yaml
minReplicas: 2
maxReplicas: 5
averageUtilization: 70
```

Meaning:

```text
Keep at least 2 Pods.
Scale up to 5 Pods if CPU utilization stays above the target.
```

Why it matters:

```text
HPA is scaling intent. It does not fix every performance problem.
If the app is slow because of a database, external API, lock contention, or bad code path, scaling may hide symptoms but not solve root cause.
```

Evidence:

```bash
kubectl get hpa -n request-tracing-lab
kubectl describe hpa request-tracing-lab -n request-tracing-lab
```

Look for:

```text
Current metrics
Target metrics
Min/max replicas
Scaling events
cpu: <unknown>/70% means metrics are unavailable
```

## Requests And Limits

Requests and limits describe resource expectations.

```yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 256Mi
```

Requests:

```text
What the container asks Kubernetes to reserve for scheduling.
```

Limits:

```text
The maximum resource amount the container can use.
```

Why it matters:

```text
Requests help the scheduler place Pods on nodes with enough capacity.
Limits prevent one workload from consuming too much.
Bad values can cause poor scheduling, throttling, or OOMKilled containers.
```

Evidence:

```bash
kubectl describe pod -n request-tracing-lab <pod-name>
kubectl top pod -n request-tracing-lab
```

Look for:

```text
CPU throttling symptoms
OOMKilled
Pending Pods due to insufficient resources
High usage compared to requests
```

## Secrets

Secrets provide sensitive runtime configuration.

In this project:

```yaml
env:
  - name: FLASK_SECRET_KEY
    valueFrom:
      secretKeyRef:
        name: request-tracing-lab-secrets
        key: FLASK_SECRET_KEY
```

Meaning:

```text
Inject this value into the container at runtime from a Kubernetes Secret.
```

Why it matters:

```text
The Docker image should contain reusable application code, not environment-specific secrets.
Secrets let local, staging, and production use the same image with different runtime values.
```

Evidence:

```bash
kubectl get secret -n request-tracing-lab
kubectl describe secret request-tracing-lab-secrets -n request-tracing-lab
```

Do not print real secret values during normal troubleshooting.

## NetworkPolicy

NetworkPolicy controls allowed traffic to or from selected Pods, if the cluster network plugin enforces it.

Why it matters:

```text
It limits blast radius by making network access explicit.
It helps move from "everything can talk to everything" toward intentional service-to-service access.
```

Evidence:

```bash
kubectl get networkpolicy -n request-tracing-lab
kubectl describe networkpolicy request-tracing-lab-ingress -n request-tracing-lab
```

Look for:

```text
Selected Pods
Allowed ports
Allowed sources
Whether the cluster CNI enforces NetworkPolicy
```

## Common Failure Patterns

```text
Browser shows 502:
Check DevTools first, then inspect proxy/Ingress logs, Service, and Endpoints.

Service exists but traffic fails:
Check Endpoints. No endpoints means the Service has no ready Pods behind it.

Pods Running but not Ready:
Check readiness probe, app health route, and Pod events.

Pods restarting:
Check liveness probe, app logs, exit codes, and resource pressure.

ImagePullBackOff:
Check image name, tag, registry access, pull secrets, and whether the image exists in the cluster runtime.

HPA shows cpu: <unknown>:
Check metrics-server and resource metrics availability.

Ingress exists but host fails:
Check ingress controller, host rule, local DNS or /etc/hosts, Service backend, and TLS settings.
```

## Practical Troubleshooting Loop

```text
1. State the symptom.
2. Identify the layer most likely returning the symptom.
3. Collect one piece of evidence from the client.
4. Collect one piece of evidence from Kubernetes routing.
5. Collect one piece of evidence from the workload/runtime.
6. Compare expected vs actual.
7. Make one change.
8. Re-test the same path.
```

Example:

```text
Symptom:
Browser API call returns 502.

Client evidence:
DevTools shows which URL failed and which server returned the 502.

Routing evidence:
kubectl get endpoints shows whether backend Pods exist behind the Service.

Runtime evidence:
kubectl logs shows whether the proxy or backend received the request.

Next step:
If endpoints exist, inspect proxy config and backend logs.
If endpoints are empty, inspect Service selector and Pod readiness.
```
