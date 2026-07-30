# Failure 03: Invalid JWT

## Scenario

Call the JWT profile endpoint with a malformed or invalid bearer token.

## Trigger The Failure

```bash
curl -i \
  -H "Authorization: Bearer invalid.token.value" \
  -H "X-Request-ID: failure-03-invalid-jwt" \
  http://127.0.0.1:5000/jwt/profile
```

## Evidence To Collect

```text
Request method and path:
Authorization header shape:
Response status:
Response body:
X-Request-ID:
Matching server log:
Failed layer:
What this rules out:
```

## Completion Standard

You are done when you can prove Flask received the request and rejected the bearer token as invalid.

## Write Your Answer

Use:

```text
AnswersByGetty/phase-01-single-service-request-tracing/phase-2-inject-and-diagnose-failures/failure-03-invalid-jwt.md
```
