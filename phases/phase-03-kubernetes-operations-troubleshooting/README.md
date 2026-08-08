# Phase 3 — Containerized Systems & Kubernetes Troubleshooting

Take the same application into Docker and Kubernetes, then learn how container runtime behavior, networking, deployment state, Services, EndpointSlices, probes, configuration, rollouts, Helm, and dependencies affect the request path.

Phase 3 is the transition from:

```text
I understand service boundaries.
```

to:

```text
I can operate and troubleshoot those service boundaries inside containers and Kubernetes.
```

This is not a Kubernetes cluster-administration course. The focus is Kubernetes application and operator troubleshooting with enough platform understanding to reason correctly about the environment.

## What Phase 2 Leaves Us With

Phase 2 ends with a service-boundary model:

```text
Client
  ↓
NGINX
  ↓
Application
  ├── Redis
  └── PostgreSQL
```

Phase 3 keeps the same application and request-tracing habits, then changes where the system runs.

## What Containers Add

Docker introduces packaging, runtime configuration, port mapping, container networking, filesystem behavior, and container health.

```text
Client
  ↓
Host published port
  ↓
NGINX container
  ↓
Docker network
  ↓
API container
  ├── Redis container
  └── PostgreSQL container
```

New failure boundaries include image build failures, bad runtime commands, wrong host/container ports, `localhost` confusion, missing environment variables, wrong service DNS names, container network mismatches, and dependency startup/readiness gaps.

## What Kubernetes Adds

Kubernetes adds a management path and a traffic path. They answer different questions.

### Management Path

```text
Deployment
  ↓
ReplicaSet
  ↓
Pod
```

This path answers:

```text
Why does the workload exist or fail to exist?
```

### Traffic Path

```text
Client
  ↓
Ingress
  ↓
Service
  ↓
EndpointSlice
  ↓
Ready Pod
  ↓
Container
  ↓
Application
  ↓
Dependency
```

This path answers:

```text
Can the request reach a healthy workload?
```

A Service does not route traffic to a Deployment. A Deployment creates ReplicaSets, ReplicaSets create Pods, and a Service selects Ready Pod endpoints.

## Troubleshooting Method

Every major lab uses the same investigation loop:

```text
Symptom
  ↓
Expected request path
  ↓
Known-good boundaries
  ↓
First unknown boundary
  ↓
Evidence
  ↓
Hypothesis
  ↓
Test
  ↓
Root cause
  ↓
Fix / mitigation
  ↓
Validation
  ↓
Prevention / runbook / automation
```

Do not run commands as a reflex. Each command should answer a specific boundary question.

## Required Labs

| Lab | Focus | Start |
| --- | --- | --- |
| 01 | Images, Dockerfiles, and build/runtime boundaries | [LABS.md#lab-01-images-dockerfiles--buildruntime-boundaries](LABS.md#lab-01-images-dockerfiles--buildruntime-boundaries) |
| 02 | Runtime configuration, ports, processes, and filesystem | [LABS.md#lab-02-runtime-configuration-ports-processes--filesystem](LABS.md#lab-02-runtime-configuration-ports-processes--filesystem) |
| 03 | Docker networking, DNS, and container health | [LABS.md#lab-03-docker-networking-dns--container-health](LABS.md#lab-03-docker-networking-dns--container-health) |
| 04 | Docker Compose full-stack operations | [LABS.md#lab-04-docker-compose-full-stack-operations](LABS.md#lab-04-docker-compose-full-stack-operations) |
| 05 | Kubernetes workloads and traffic-path troubleshooting | [LABS.md#lab-05-kubernetes-workloads--traffic-path-troubleshooting](LABS.md#lab-05-kubernetes-workloads--traffic-path-troubleshooting) |
| 06 | Readiness, dependencies, DNS, config, and resource failures | [LABS.md#lab-06-readiness-dependencies-dns-config--resource-failures](LABS.md#lab-06-readiness-dependencies-dns-config--resource-failures) |
| 07 | Rollouts, releases, rollback, and persistent state | [LABS.md#lab-07-rollouts-releases-rollback--persistent-state](LABS.md#lab-07-rollouts-releases-rollback--persistent-state) |
| 08 | Helm, complex incident, runbook, and diagnostic automation | [LABS.md#lab-08-helm-complex-incident-runbook--diagnostic-automation](LABS.md#lab-08-helm-complex-incident-runbook--diagnostic-automation) |

## Architecture References

- [Docker request path](architecture/docker-request-path.md)
- [Kubernetes traffic and management paths](architecture/kubernetes-paths.md)
- [Kubernetes dependency path](architecture/dependency-path.md)

## Phase 3 Assets

| Area | Path |
| --- | --- |
| Docker notes and NGINX config | [docker/](docker/) |
| Docker Compose stack | [docker-compose.yml](docker-compose.yml) |
| Kubernetes manifests | [kubernetes/](kubernetes/) |
| Helm chart | [helm/request-tracing-lab/](helm/request-tracing-lab/) |
| Challenges | [challenges/README.md](challenges/README.md) |
| Runbooks | [runbooks/README.md](runbooks/README.md) |
| Diagnostic helper | [scripts/diagnose-service-routing.sh](scripts/diagnose-service-routing.sh) |
| Evidence guide | [../../AnswersByGetty/phase-03.md](../../AnswersByGetty/phase-03.md) |

## What Is Out Of Scope For Phase 3

Phase 3 stays focused on local Docker, Docker Compose, Kubernetes application troubleshooting, Helm packaging, runbooks, and diagnostic evidence. Broader cloud, observability-platform, infrastructure-as-code, and capacity-planning topics are intentionally deferred to later phases.

Those belong in later phases after vanilla container and Kubernetes request paths are understood deeply.

## Completion Standard

By the end of Phase 3, the learner should be able to explain the expected request path, identify what evidence each boundary exposes, find where behavior first diverged, prove the root cause, restore service safely, and make the next investigation easier.
