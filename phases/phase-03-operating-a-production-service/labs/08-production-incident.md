# Lab 08: Production Incident

Investigate a realistic production incident and write the RCA.

This lab should include one synchronous failure and one asynchronous-style failure.

Examples:

```text
Synchronous failure:
Login is slow because PostgreSQL queries are slow.

Asynchronous failure:
A background report job is queued but workers are not processing it.

Real-time symptom:
The user expects live progress, but the progress UI stops updating.
```

## Tasks

1. Start from a vague customer symptom.
2. Build a timeline.
3. Trace the request path.
4. Decide whether the symptom is synchronous, asynchronous, real-time, or a mix.
5. Rank hypotheses.
6. Collect evidence.
7. Mitigate the issue.
8. Write customer and engineering updates.
9. Write prevention work.

## Evidence To Capture

```text
Customer symptom:
Timeline:
Request path:
Sync, async, or real-time classification:
Hypotheses:
Evidence:
Queue or worker evidence, if relevant:
Root cause:
Mitigation:
Customer update:
Engineering follow-up:
Prevention:
Retained takeaway:
```
