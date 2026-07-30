# Failure 10: Slow Request

## Scenario

Call an endpoint that intentionally delays before returning a response.

## Trigger The Failure

```bash
curl -i \
  -w "\nTotal time: %{time_total}s\n" \
  -H "X-Request-ID: failure-10-slow-request" \
  http://127.0.0.1:5000/slow
```

## Evidence To Collect

```text
Request method and path:
Response status:
Response body:
Total client time:
X-Request-ID:
Matching server log:
Failed or slow layer:
What this rules out:
```

## Completion Standard

You are done when you can separate a slow successful response from a timeout, outage, or unhandled exception.

## Write Your Answer

Use:

```text
AnswersByGetty/phase-01-single-service-request-tracing/phase-2-inject-and-diagnose-failures/failure-10-slow-request.md
```
