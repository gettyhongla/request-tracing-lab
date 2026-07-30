# Lab 05: Trace Session Authentication

## Goal

Trace cookie-based authentication from login through an authenticated profile request.

## Start The App

```bash
cd /Users/heavenlygetty/Documents/request-tracing-lab
source venv/bin/activate
python app.py
```

## Log In And Store The Session Cookie

```bash
curl -i \
  -c /tmp/request-tracing-session-cookie.txt \
  -H "Content-Type: application/json" \
  -H "X-Request-ID: lab-05-session-login" \
  -d '{"username":"getty","password":"cloud"}' \
  http://127.0.0.1:5000/session/login
```

## Use The Session Cookie

```bash
curl -i \
  -b /tmp/request-tracing-session-cookie.txt \
  -H "X-Request-ID: lab-05-session-profile" \
  http://127.0.0.1:5000/session/profile
```

## Evidence To Collect

```text
Login request method and path:
Login response status:
Set-Cookie response header:
Profile request method and path:
Cookie request header:
Profile response status:
Matching server logs for both request IDs:
```

## Completion Standard

You are done when you can explain where the session cookie was created, where it was sent back, and why the profile request succeeded.

## Write Your Answer

Use:

```text
AnswersByGetty/phase-01-single-service-request-tracing/phase-1-observe-successful-requests/lab-05-trace-session-authentication.md
```
