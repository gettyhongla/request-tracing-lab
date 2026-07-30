# Failure 04: Expired JWT

## Scenario

Call the JWT profile endpoint with a token that is structurally valid but expired.

## Trigger The Failure

```bash
curl -i \
  -H "Authorization: Bearer <expired-token>" \
  -H "X-Request-ID: failure-04-expired-jwt" \
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

You are done when you can explain the difference between an invalid token and a valid token whose expiration time is no longer accepted.

## Write Your Answer

Use:

```text
AnswersByGetty/phase-01-single-service-request-tracing/phase-2-inject-and-diagnose-failures/failure-04-expired-jwt.md
```
