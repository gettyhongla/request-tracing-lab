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
Authorization header shape:
Client status and error message:
Matching Flask logs:
Failed layer:
What this rules out:
```

## Hint

Do not focus on the full token value. Focus on whether a bearer token was presented and how Flask classified it.

## Completion Standard

You are done when you can prove Flask received the request and rejected the bearer token as invalid.

## Write Your Answer

Use:

```text
AnswersByGetty/phase-01-single-service-request-tracing/phase-2-inject-and-diagnose-failures/failure-03-invalid-jwt.md
```
