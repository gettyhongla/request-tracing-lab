# Incident Response Workbook

Use this section to practice operating a production system under pressure.

The goal is not to memorize tools. The goal is to build a repeatable investigation method you can explain clearly in interviews, customer calls, and engineering reviews.

## Weekly Operating Loop

For each weekly scenario, complete the same loop:

```text
Design
  |
  v
Trace
  |
  v
Break
  |
  v
Investigate
  |
  v
Mitigate
  |
  v
Root cause
  |
  v
Postmortem
  |
  v
Explain
```

## Scenario Template

```text
Week:

Customer report:

Architecture under test:

Expected request path:

Actual symptom:

User impact:

Start time:

Detection source:
```

## Evidence To Collect

```text
Reproduction steps:

Request path:

Request ID or trace ID:

Relevant logs:

Relevant metrics:

Relevant traces:

Dashboard observations:

Recent changes:

Failed dependency:

Customer-visible symptom:

Internal system symptom:
```

## Investigation Method

Move from broad impact to specific evidence:

```text
Can I reproduce it?

Who is affected?

When did it start?

What changed?

Which layer is failing?

What evidence proves that layer is failing?

What evidence rules out nearby layers?

What is the fastest safe mitigation?

What is the actual root cause?

What prevents recurrence?
```

## Root Cause Analysis

Write the RCA from evidence, not guesses.

```text
Primary failure:

Trigger:

Contributing factors:

Why detection did or did not work:

Why mitigation did or did not work:

Evidence proving the root cause:

Evidence ruling out alternatives:
```

## Postmortem Template

```text
Title:

Date:

Severity:

Customer impact:

Timeline:

What happened:

Root cause:

Detection:

Mitigation:

Resolution:

What went well:

What went poorly:

Where we got lucky:

Action items:
```

## Explanation Practice

Record two explanations for every incident.

Customer explanation:

```text
What happened in plain language?

What impact did customers experience?

What did we do to restore service?

What are we doing to prevent recurrence?
```

Engineering explanation:

```text
What component failed?

How did the request path change during failure?

Which signals exposed the issue?

What hypotheses were tested?

Why was the chosen mitigation safe?

What permanent fix is required?
```

## Weekly Scenario Ideas

```text
Login is slow.

Users receive intermittent 500s.

A dependency times out.

The database connection pool is exhausted.

Cache misses overload the backend.

A queue backlog delays processing.

An external API returns 429s.

Session state is inconsistent across instances.

TLS certificate validation fails.

A dashboard alert fires but the customer symptom is unclear.
```
