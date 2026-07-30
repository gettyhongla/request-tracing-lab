# Failure 11: Application Exception

## Scenario

Call an endpoint that intentionally raises and logs an application error.

## Trigger The Failure

```bash
curl -i \
  -H "X-Request-ID: failure-11-application-exception" \
  http://127.0.0.1:5000/error
```

## Evidence To Collect

```text
Request method and path:
Response status:
Response body:
X-Request-ID:
request_started log:
application_error log:
request_finished log:
Failed layer:
What this rules out:
```

## Completion Standard

You are done when you can prove the request reached Flask and Flask returned a controlled `500` with matching error evidence.

## Write Your Answer

Use:

```text
AnswersByGetty/phase-01-single-service-request-tracing/phase-2-inject-and-diagnose-failures/failure-11-application-exception.md
```
