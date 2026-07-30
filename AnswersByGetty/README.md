# Answers By Getty

This directory contains Getty's completed answers, investigation notes, deployment evidence, and reflections.

These files show how evidence turns into a clear technical conclusion.

These files are the portfolio proof of work. They should show:

* What I observed
* What evidence I collected
* What I ruled out
* What I concluded
* What I would do next in production
* What concept I want to retain for future phases

## Phase 1 Answers

```text
AnswersByGetty/phase-01-single-service-request-tracing/
|-- phase-1-observe-successful-requests/
|-- phase-2-inject-and-diagnose-failures/
```

Phase 1 answers focus on:

* Client evidence from DevTools or `curl`
* Server evidence from Flask logs
* Request and response separation
* Session cookie flow
* JWT bearer-token flow
* `X-Request-ID` correlation
* Clear takeaways to retain before Phase 2

## Phase 3 Answers

```text
AnswersByGetty/phase-03-production-deployment-foundation/
|-- lab-01-container-readiness.md
|-- lab-02-container-packaging.md
|-- lab-03-kubernetes-manifests.md
```

Phase 3 answers focus on:

* Container runtime configuration
* Docker image packaging
* Kubernetes manifests
* Pod, Service, Ingress, Secret, HPA, and NetworkPolicy evidence
* Deployment troubleshooting and production readiness

## Active Answer Sets

The public `main` branch currently keeps answer sets for the phases being built and validated:

```text
AnswersByGetty/phase-01-single-service-request-tracing/
AnswersByGetty/phase-02-three-tier-application/
AnswersByGetty/phase-03-production-deployment-foundation/
```

Future answer sets should be added to `main` only when their labs and evidence are ready to publish.

Keep timestamps, request IDs, cookies, and tokens realistic, but redact secrets and personal notes that do not belong in a public repository.
