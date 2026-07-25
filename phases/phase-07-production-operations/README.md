# Phase 7: Production Operations

Phase 7 combines deployment operations and incident response.

At this point, the lab should feel like operating a real service: releases happen, health checks matter, alerts fire, customers report symptoms, and every conclusion needs evidence.

## Release Operations

Before and after each deploy, practice:

```text
Review the change.
Confirm the rollback plan.
Deploy the release.
Verify health checks.
Check request success rate.
Check latency.
Check error rate.
Check logs for the new version.
Confirm critical user flows.
Decide whether to promote, pause, roll back, or roll forward.
```

Investigation loop:

```text
Establish impact
Reproduce safely
Collect evidence
Build hypotheses
Run the cheapest disconfirming check
Identify the failed layer
Mitigate
Prove root cause
Prevent recurrence
```

Required outputs:

* Deployment checklist
* Rollback plan
* Investigation notes
* Customer status update
* Engineering escalation
* Runbook
* Post-incident review

Completion standard:

```text
Given a production deploy or production symptom, communicate clearly before, during, and after the change or incident without overstating what the evidence proves.
```
