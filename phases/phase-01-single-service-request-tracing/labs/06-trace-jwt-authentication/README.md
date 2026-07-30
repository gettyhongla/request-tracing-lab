# Lab 06: Trace JWT Authentication

## Goal

Trace token-based authentication from token creation through an authenticated profile request.

## Start The App

```bash
cd /Users/heavenlygetty/Documents/request-tracing-lab
source venv/bin/activate
python app.py
```

## Trace The JWT In The Browser

Open:

```text
http://127.0.0.1:5000/
```

Use the JWT login control. In DevTools, inspect the `/jwt/login` response body and the `/jwt/profile` request headers.

## Request A JWT With curl

```bash
curl -i \
  -H "Content-Type: application/json" \
  -H "X-Request-ID: lab-06-jwt-login" \
  -d '{"username":"getty","password":"cloud"}' \
  http://127.0.0.1:5000/jwt/login
```

Copy the token from the response. Redact the token in your public notes.

## Use The JWT With curl

```bash
curl -i \
  -H "Authorization: Bearer <token>" \
  -H "X-Request-ID: lab-06-jwt-profile" \
  http://127.0.0.1:5000/jwt/profile
```

## Evidence To Collect

```text
JWT login response status:
Where the token appears:
Authorization header shape on /jwt/profile:
Profile response status:
Matching Flask logs for login and profile:
Browser and curl comparison:
```

## Hint

Do not paste full tokens into public notes. The important proof is where the token was issued and how it was presented back as `Authorization: Bearer <token>`.

## Completion Standard

You are done when you can explain how the browser sends the bearer token, how `curl` sends the same token explicitly, and which evidence proves the token was accepted.

## Write Your Answer

Use:

```text
AnswersByGetty/phase-01-single-service-request-tracing/phase-1-observe-successful-requests/lab-06-trace-jwt-authentication.md
```
