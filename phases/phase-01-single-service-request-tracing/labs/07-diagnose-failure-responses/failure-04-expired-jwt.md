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
Token state:
Client status and error message:
Matching Flask logs:
Failed layer:
What this rules out:
```

## Hint

Expired and invalid tokens can both return `401`. The key difference is whether the token was structurally valid but rejected because its lifetime ended.

## Completion Standard

You are done when you can explain the difference between an invalid token and a valid token whose expiration time is no longer accepted.

## Write Your Answer

Use:

```text
AnswersByGetty/phase-01-single-service-request-tracing/phase-2-inject-and-diagnose-failures/failure-04-expired-jwt.md
```
