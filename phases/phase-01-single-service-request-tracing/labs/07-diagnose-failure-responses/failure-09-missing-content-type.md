# Failure 09: Missing Content-Type

## Scenario

Submit a JSON-looking login body without declaring `Content-Type: application/json`.

## Trigger The Failure

```bash
curl -i \
  -H "X-Request-ID: failure-09-missing-content-type" \
  -d '{"username":"getty","password":"cloud"}' \
  http://127.0.0.1:5000/session/login
```

## Evidence To Collect

```text
Request method and path:
Content-Type header present:
Request body:
Response status:
Response body:
X-Request-ID:
Matching server log:
Failed layer:
What this rules out:
```

## Completion Standard

You are done when you can explain why the body alone is not enough if the application expects JSON parsing behavior.

## Write Your Answer

Use:

```text
AnswersByGetty/phase-01-single-service-request-tracing/phase-2-inject-and-diagnose-failures/failure-09-missing-content-type.md
```
