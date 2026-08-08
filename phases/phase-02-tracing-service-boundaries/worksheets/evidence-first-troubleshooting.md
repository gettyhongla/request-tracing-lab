# Evidence-First Troubleshooting Worksheet

Use this worksheet for Phase 2 challenge labs.

## Observed Symptom

```text
What exactly failed?
What did the client, user, or system actually report?
Avoid naming a root cause yet.
```

## Expected Request Path

```text
Draw the expected path:
client -> NGINX -> API -> dependency
```

## Known-Good Boundaries

```text
What evidence proves a boundary worked?
Client evidence:
NGINX access log:
NGINX error log:
Flask log:
Redis evidence:
PostgreSQL evidence:
```

## First Unknown Boundary

```text
Where does certainty stop?
What is the next boundary to prove?
```

## Evidence Needed

```text
What command, log, or status would prove or disprove the next hop?
Why does this evidence answer that question?
What would it NOT prove?
```

## Evidence Collected

```text
Paste actual output here.
```

## Hypothesis

```text
Based on the evidence, what is the most likely failed boundary?
```

## Test

```text
What check would confirm or reject the hypothesis?
```

## Root Cause

```text
What actually failed?
```

## Fix

```text
What changed?
```

## Validation

```text
What proves the original behavior recovered?
```

## Improvement

```text
Could this be detected earlier?
Could it be prevented?
Could it be documented?
Could it be monitored?
Could a safe validation or automation step catch it next time?
```
