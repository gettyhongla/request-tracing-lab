# Lab 06: Trace JWT Authentication

## Goal

Trace token-based authentication from token creation through an authenticated profile request.

## Start The App

```bash
cd /Users/heavenlygetty/Documents/request-tracing-lab
source venv/bin/activate
python app.py
```

## Request A JWT

```bash
curl -i \
  -H "Content-Type: application/json" \
  -H "X-Request-ID: lab-06-jwt-login" \
  -d '{"username":"getty","password":"cloud"}' \
  http://127.0.0.1:5000/jwt/login
```

Copy the token from the response. Redact the token in your public notes.

## Use The JWT

```bash
curl -i \
  -H "Authorization: Bearer <token>" \
  -H "X-Request-ID: lab-06-jwt-profile" \
  http://127.0.0.1:5000/jwt/profile
```

## Evidence To Collect

```text
JWT login request method and path:
JWT login response status:
Token returned:
Profile request method and path:
Authorization header shape:
Profile response status:
Matching server logs for both request IDs:
```

## Completion Standard

You are done when you can explain how JWT authentication differs from session-cookie authentication and which evidence proves the token was accepted.

## Write Your Answer

Use:

```text
AnswersByGetty/phase-01-single-service-request-tracing/phase-1-observe-successful-requests/lab-06-trace-jwt-authentication.md
```
