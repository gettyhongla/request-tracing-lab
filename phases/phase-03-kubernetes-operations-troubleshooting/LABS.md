# Phase 3 Labs: Containerized Systems & Kubernetes Troubleshooting

## Table Of Contents

1. [Lab 01: Images, Dockerfiles & Build/Runtime Boundaries](#lab-01-images-dockerfiles--buildruntime-boundaries)
2. [Lab 02: Runtime Configuration, Ports, Processes & Filesystem](#lab-02-runtime-configuration-ports-processes--filesystem)
3. [Lab 03: Docker Networking, DNS & Container Health](#lab-03-docker-networking-dns--container-health)
4. [Lab 04: Docker Compose Full-Stack Operations](#lab-04-docker-compose-full-stack-operations)
5. [Lab 05: Kubernetes Workloads & Traffic-Path Troubleshooting](#lab-05-kubernetes-workloads--traffic-path-troubleshooting)
6. [Lab 06: Readiness, Dependencies, DNS, Config & Resource Failures](#lab-06-readiness-dependencies-dns-config--resource-failures)
7. [Lab 07: Rollouts, Releases, Rollback & Persistent State](#lab-07-rollouts-releases-rollback--persistent-state)
8. [Lab 08: Helm, Complex Incident, Runbook & Diagnostic Automation](#lab-08-helm-complex-incident-runbook--diagnostic-automation)

## Lab 01: Images, Dockerfiles & Build/Runtime Boundaries

Deep focus: image vs container, Dockerfile, build context, `.dockerignore`, layers, dependency installation, deterministic builds, entrypoint/CMD, container process, PID 1 basics, non-root execution, stdout/stderr, tags, and digest concepts.

### Architecture Before

```text
python app.py -> Flask process on the laptop
```

### Architecture After

```text
Dockerfile -> image -> container process -> Flask application
```

### Must Implement Or Inspect

1. Inspect the root [Dockerfile](../../Dockerfile).
2. Inspect the root [.dockerignore](../../.dockerignore).
3. Build the application image with an explicit local tag.
4. Explain which steps happen at build time.
5. Explain which settings are runtime configuration.
6. Run the container and confirm the container process stays alive.
7. Confirm logs go to stdout/stderr.
8. Confirm the container runs as a non-root user.
9. Inspect image tags and explain tag vs digest conceptually.
10. Classify one failure as build-time, container-start, or application-runtime.

### Healthy-Path Verification

Capture:

```text
Build command:
Image tag:
Container run command:
Container process:
User inside container:
Log evidence:
Health endpoint response:
Request ID:
```

### Controlled Failures

Test at least two:

```text
Docker build fails:
Wrong build context:
Dependency missing:
Bad command or entrypoint:
Wrong working directory:
Stale image/tag misunderstanding:
Container starts and exits immediately:
```

### Evidence To Capture

```text
Dockerfile path:
Build context:
.dockerignore evidence:
Build-time failure evidence:
Container-start failure evidence:
Application-runtime failure evidence:
Image tag:
Container ID/name:
Log output:
Retained takeaway:
```

### Troubleshooting Checklist

```text
Did Docker receive the expected build context?
Did dependency installation happen during build?
Did the image build but the container fail to start?
Did the container start but the application fail at runtime?
What command is PID 1 running?
Does the container run as a non-root user?
Are logs visible without entering the container?
Are you testing the image you just built or a stale tag?
```

### Completion Standard

```text
The learner can distinguish image build failures, container startup failures, and application runtime failures using Docker evidence.
```

### Retained Takeaway

```text
An image packages the application. A container runs one process from that image with runtime configuration.
```

## Lab 02: Runtime Configuration, Ports, Processes & Filesystem

Deep focus: environment variables, configuration injection, secrets concept, container port, published host port, application listener, `0.0.0.0` vs localhost, read-only/writable filesystem, volumes, bind mounts, persistent vs ephemeral data, and graceful startup/shutdown.

### Request Path

```text
Client
  ↓
Host port
  ↓
Container published port
  ↓
Application listener
```

### Must Implement Or Inspect

1. List the app's runtime environment variables.
2. Run the app locally with container-style environment variables.
3. Explain `0.0.0.0` vs `127.0.0.1` inside a container.
4. Run the container with a published host port.
5. Prove host port, container port, and Flask listener alignment.
6. Identify which data is ephemeral in the app container.
7. Identify which data requires a volume or external dependency.
8. Inspect graceful startup and shutdown evidence.
9. Inject a wrong port or wrong bind-address scenario conceptually or practically.
10. Inject a missing or bad secret/config value where safe.

### Healthy-Path Verification

Capture:

```text
Runtime env vars:
docker run command:
docker ps port mapping:
curl response:
Flask listener evidence:
Container logs:
Filesystem or volume decision:
```

### Controlled Failures

Test or reason with evidence:

```text
Application listens on wrong port:
Published port wrong:
Application bound to localhost inside container:
Required environment variable missing:
Bad secret/config value:
Wrong mounted configuration:
Permission failure:
```

### Evidence To Capture

```text
Host port:
Container port:
Application listener:
Environment variable:
Secret/config source:
Failure symptom:
What the symptom proves:
Retained takeaway:
```

### Troubleshooting Checklist

```text
Did the request reach the host port?
Does docker ps show the expected port publishing?
Is Flask listening on the same port the container exposes?
Is the app bound to 0.0.0.0 inside the container?
Is the failing setting build-time or runtime?
Would deleting the container delete important state?
```

### Completion Standard

```text
The learner can trace from client host port to container port to application listener and explain runtime configuration failures.
```

### Retained Takeaway

```text
Most container runtime failures are boundary mismatches: port, process, filesystem, or configuration.
```

## Lab 03: Docker Networking, DNS & Container Health

Deep focus: bridge networking, container DNS, container-to-container communication, hostname vs localhost, network attachment, dependency startup, health checks, logs, and container inspection.

### Request Path

```text
Browser
  ↓
Host
  ↓
NGINX container
  ↓
Docker network
  ↓
API container
  ↓
Redis/PostgreSQL
```

### Must Implement Or Inspect

1. Create or inspect the Docker network used by the stack.
2. Explain why containers should use service names instead of localhost for other containers.
3. Run NGINX and API containers on the same network.
4. Confirm NGINX can resolve and reach the API container.
5. Confirm the API can resolve and reach Redis.
6. Confirm the API can resolve and reach PostgreSQL.
7. Inspect container health status.
8. Use `docker logs` to connect symptoms to container behavior.
9. Use `docker inspect` to inspect network and health details.
10. Classify one dependency failure as DNS, port, network, process, or readiness.

### Healthy-Path Verification

Capture:

```text
docker ps:
docker network inspect:
NGINX logs:
API logs:
Redis connectivity:
PostgreSQL connectivity:
Health status:
Client response:
```

### Controlled Failures

Test at least two:

```text
Wrong service hostname:
Wrong port:
Containers on different networks:
Dependency unavailable:
NGINX upstream misconfigured:
Container healthy but dependency unreachable:
Health check incorrect:
```

### Evidence To Capture

```text
Question asked:
Command used:
Output:
Boundary proven:
What remains unknown:
Next boundary:
Retained takeaway:
```

### Troubleshooting Checklist

```text
Is the source container attached to the expected network?
Does the destination name resolve inside that network?
Is the destination process listening on the expected port?
Does health mean only process-alive or dependency-ready?
Which container produced the error log?
```

### Completion Standard

```text
The learner can troubleshoot container-to-container request paths without confusing laptop localhost with container DNS.
```

### Retained Takeaway

```text
Docker networking turns service names, networks, ports, and health checks into first-class troubleshooting evidence.
```

## Lab 04: Docker Compose Full-Stack Operations

Use Docker Compose to run the Phase 2 architecture as a connected system.

### Request Path

```text
Client
  ↓
NGINX
  ↓
API
  ├── Redis
  └── PostgreSQL
```

### Must Implement Or Inspect

1. Inspect [docker-compose.yml](docker-compose.yml).
2. Start the stack with Docker Compose.
3. Explain service dependencies versus actual readiness.
4. Trace a request through NGINX to the API container.
5. Inspect logs across NGINX, API, Redis, and PostgreSQL.
6. Verify Docker DNS and network names.
7. Inspect the PostgreSQL volume decision.
8. Restart one dependency and observe propagation.
9. Inject an NGINX-to-API failure.
10. Inject a Redis or PostgreSQL dependency failure.

### Healthy-Path Verification

Capture:

```text
docker compose config:
docker compose ps:
Client response through NGINX:
NGINX log:
API log:
Redis evidence:
PostgreSQL evidence:
Volume evidence:
```

### Controlled Failures

Test at least two:

```text
Redis unavailable:
PostgreSQL unavailable:
NGINX cannot reach API:
Application starts before dependency is usable:
Configuration mismatch:
```

### Evidence To Capture

```text
Service:
Expected boundary:
Symptom:
docker compose ps:
docker compose logs:
Network evidence:
Dependency evidence:
Mitigation:
Validation:
Retained takeaway:
```

### Troubleshooting Checklist

```text
Which service returned the client-visible status?
Did NGINX reach the API?
Did the API reach PostgreSQL?
Did the API reach Redis?
Was the dependency not started, not ready, or misconfigured?
What does Compose dependency order prove, and what does it not prove?
```

### Completion Standard

```text
The learner can operate the Phase 2 stack through Compose and isolate failures across container service boundaries.
```

### Retained Takeaway

```text
Compose starts services together, but readiness and request-path evidence still have to be proven.
```

## Lab 05: Kubernetes Workloads & Traffic-Path Troubleshooting

This lab teaches the Kubernetes management path and traffic path as separate investigations.

### Management Path

```text
Deployment
  ↓
ReplicaSet
  ↓
Pod
```

### Traffic Path

```text
Ingress
  ↓
Service
  ↓
EndpointSlice
  ↓
Ready Pod
  ↓
Application
```

### Must Implement Or Inspect

1. Apply or inspect the namespace, Deployment, Service, and Ingress manifests.
2. Explain Deployment, ReplicaSet, and Pod responsibilities.
3. Explain labels and selectors.
4. Confirm the Deployment created a ReplicaSet.
5. Confirm the ReplicaSet created Pods.
6. Confirm Pods are Running and Ready.
7. Confirm the Service selector matches Pod labels.
8. Confirm EndpointSlices contain ready endpoints.
9. Confirm Service `port` and `targetPort` match the Pod/container port.
10. Confirm the Ingress routes to the intended Service.
11. Classify one symptom as management-path or traffic-path.
12. Use Kubernetes events/logs to identify the first failed boundary.

### Workload Creation Failures

Practice:

```text
Deployment applies but no Pod appears:
ReplicaSet exists but cannot create Pod:
Pod Pending:
ImagePullBackOff:
CrashLoopBackOff:
Container exits immediately:
```

### Traffic Failures

Practice:

```text
Service selector mismatch:
Service has no EndpointSlices/endpoints:
Wrong targetPort:
Application listening on wrong port:
Ingress references wrong Service:
Ingress 404:
Ingress/proxy 502 or 503 where appropriate:
Healthy Pod but broken route:
```

### Evidence To Capture

```text
kubectl get deploy:
kubectl get rs:
kubectl get pods:
kubectl describe pod:
kubectl get svc:
kubectl get endpointslices:
kubectl get ingress:
kubectl logs:
kubectl get events:
Failed path classification:
Retained takeaway:
```

### Troubleshooting Checklist

```text
Am I investigating why the workload exists, or whether traffic reaches it?
Does the Deployment own a ReplicaSet?
Does the ReplicaSet own Pods?
Are Pods scheduled, started, and Ready?
Does the Service selector match Pod labels?
Does the EndpointSlice show ready endpoints?
Does targetPort match the app container port?
Did the request reach Flask logs?
```

### Completion Standard

```text
The learner can distinguish management-path failures from traffic-path failures and use Kubernetes object evidence to find the first failed boundary.
```

### Retained Takeaway

```text
Kubernetes troubleshooting starts by choosing the path: workload creation or request traffic.
```

## Lab 06: Readiness, Dependencies, DNS, Config & Resource Failures

Build on Phase 2 application readiness and learn how Kubernetes consumes readiness.

### Core Path

```text
Dependency failure
  ↓
Application /ready behavior
  ↓
readinessProbe
  ↓
Pod readiness
  ↓
EndpointSlice readiness
  ↓
Service traffic eligibility
  ↓
client-visible behavior
```

### Must Implement Or Inspect

1. Inspect readiness, liveness, and startup probe design.
2. Explain alive vs ready vs degraded.
3. Confirm how Pod readiness affects EndpointSlice membership.
4. Inspect ConfigMap and Secret usage.
5. Inject or reason through a missing ConfigMap.
6. Inject or reason through a missing Secret.
7. Inject or reason through a bad environment variable.
8. Test or reason through bad service DNS name.
9. Decide whether Redis failure should make the API NotReady.
10. Decide whether PostgreSQL failure should make the API NotReady.
11. Inspect resource requests and limits.
12. Diagnose OOMKilled or resource-related Pending scenarios.
13. Distinguish application bug, resource constraint, and scheduler constraint.

### Required Scenarios

```text
Pod Running but NotReady:
Readiness probe wrong:
Liveness probe causing unnecessary restart:
Startup probe concept:
Redis unavailable:
PostgreSQL unavailable:
Bad service DNS name:
Missing ConfigMap:
Missing Secret:
Bad environment variable:
Dependency reachable by DNS but not usable:
Application healthy locally but not functionally ready:
OOMKilled:
Pod Pending because resources cannot be scheduled:
```

### Evidence To Capture

```text
Pod condition:
Probe failure message:
EndpointSlice readiness:
ConfigMap/Secret reference:
Environment variable:
Dependency DNS result:
Dependency connection result:
Resource request/limit:
OOMKilled or Pending evidence:
Readiness design decision:
Retained takeaway:
```

### Troubleshooting Checklist

```text
Is the app alive, ready, or degraded?
Is the failing dependency required or optional?
Does the readiness probe test the right behavior?
Did Kubernetes remove the Pod from Service endpoints?
Is config missing, malformed, or mounted incorrectly?
Is DNS resolution different from application usability?
Is the scheduler blocked by resource requests?
Did the container exceed a memory limit?
```

### Completion Standard

```text
The learner can trace readiness from dependency behavior through Pod readiness and EndpointSlice traffic eligibility.
```

### Retained Takeaway

```text
Ready means safe to receive traffic, not merely running.
```

## Lab 07: Rollouts, Releases, Rollback & Persistent State

Focus on Kubernetes operational change.

### Required Scenario

```text
v1 healthy
  ↓
deploy v2
  ↓
new Pods fail
  ↓
rollout stalls / service degrades
  ↓
evidence
  ↓
rollback
  ↓
validate recovery
```

### Must Implement Or Inspect

1. Establish a healthy v1 baseline.
2. Inspect rollout status and current ReplicaSets.
3. Change image tag, command, probe, or configuration as a simulated v2.
4. Watch rollout status in context.
5. Inspect new and old ReplicaSets.
6. Determine whether old Pods disappeared or remained serving.
7. Confirm whether new Pods became Ready.
8. Confirm Service routes only to Ready endpoints.
9. Use rollout history to identify revisions.
10. Decide rollback vs fix-forward.
11. Roll back with evidence.
12. Validate the original request path after rollback.
13. Explain persistent-state risks during rollback.

### Evidence To Capture

```text
v1 healthy evidence:
Change made:
kubectl rollout status:
kubectl rollout history:
kubectl describe deployment:
kubectl get rs:
Pod readiness:
EndpointSlice state:
Rollback command:
Recovery validation:
Persistent-state note:
Retained takeaway:
```

### Troubleshooting Checklist

```text
What changed between revisions?
Are new Pods Ready?
Are old Pods still serving?
Is Service routing only to Ready endpoints?
Did rollback restore the original request path?
Could database/schema state make rollback unsafe?
```

### Completion Standard

```text
The learner can diagnose a bad rollout, choose rollback or fix-forward, and validate recovery with request-path evidence.
```

### Retained Takeaway

```text
Rollbacks are operational decisions backed by revision, readiness, endpoint, and request evidence.
```

## Lab 08: Helm, Complex Incident, Runbook & Diagnostic Automation

Helm belongs late in Phase 3, after raw Kubernetes resources are understood.

### Helm Path

```text
values.yaml
  ↓
templates
  ↓
rendered manifest
  ↓
Kubernetes API
  ↓
runtime resource
  ↓
request behavior
```

### Must Implement Or Inspect

1. Inspect the Helm chart structure.
2. Compare `values.yaml` to rendered templates conceptually or with `helm template`.
3. Explain how rendered manifests map to Kubernetes objects.
4. Compare desired values, rendered manifest, live object, and runtime behavior.
5. Create or inspect a bad image-tag scenario.
6. Create or inspect a wrong Service port or `targetPort` scenario.
7. Create or inspect a changed readiness-probe scenario.
8. Use Helm release commands in context where Helm is available.
9. Investigate one multi-layer incident without guessing.
10. Use a runbook during the incident.
11. Use the diagnostic helper to collect raw Service-routing evidence.
12. Explain what should be automated and what should remain human judgment.

### Complex Capstone Incident

Use one meaningful multi-layer incident:

```text
Client reports failure
  ↓
Ingress responds
  ↓
Service exists
  ↓
EndpointSlice present or missing
  ↓
Pod state questionable
  ↓
probe/config/dependency evidence
  ↓
Helm values/rendered manifest comparison
  ↓
root cause
```

### Evidence To Capture

```text
Helm values:
Rendered manifest:
Live Kubernetes object:
Runtime evidence:
Observed symptom:
Expected request path:
Known-good boundaries:
First failed boundary:
Runbook used:
Diagnostic helper output:
Root cause:
Fix or rollback:
Validation:
Prevention/automation:
Retained takeaway:
```

### Troubleshooting Checklist

```text
What did values.yaml intend?
What did Helm render?
What did Kubernetes accept?
What is the live runtime state?
Which request boundary failed first?
Which runbook matches the symptom?
Which evidence can be collected automatically next time?
Which conclusion still requires human judgment?
```

### Completion Standard

```text
The learner can diagnose a Helm-caused Kubernetes runtime issue by comparing values, rendered manifests, live objects, and request behavior.
```

### Retained Takeaway

```text
Helm is not the runtime. Helm renders Kubernetes objects; Kubernetes and the application produce the runtime evidence.
```
