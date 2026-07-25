# Phase 8: Production Architecture And Reliability

Phase 8 uses the running lab to reason about larger production systems without pretending the lab itself needs global scale.

Focus:

* Horizontal scaling
* Statelessness
* Graceful degradation
* Load and capacity testing
* Caching and backpressure
* High availability
* Regional failure
* Safe deployments and rollbacks
* Canary and blue-green deployment thinking
* SLOs, error budgets, and availability tradeoffs
* AWS service selection for production workloads
* Public and authenticated experience boundaries
* Global traffic routing and regional failure planning

## Phase 8 Contents

```text
README.md
labs/
solutions/
```

Use this phase for production design prompts such as:

```text
Management wants this React + API + database + Redis/queue system in production next week.
What do we need before saying it is safe to deploy?
What AWS services would we use?
How should it be globally available?
How do public and logged-in experiences differ?
```

Completion standard:

```text
Given a reliability or deployment goal, explain the architecture, AWS service choices, operational cost, failure modes, rollout strategy, rollback strategy, security controls, test evidence, and production-readiness criteria.
```
