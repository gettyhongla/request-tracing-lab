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
Client timing:
HTTP status:
Matching Flask logs:
Slow layer:
What this rules out:
```

## Hint

A slow request is not automatically a failed request. First decide whether the response eventually succeeded, then decide where the time was spent.

## Completion Standard

You are done when you can separate a slow successful response from a timeout, outage, or unhandled exception.

## Write Your Answer

Use:

```text
AnswersByGetty/phase-01-single-service-request-tracing/phase-2-inject-and-diagnose-failures/failure-10-slow-request.md
```
