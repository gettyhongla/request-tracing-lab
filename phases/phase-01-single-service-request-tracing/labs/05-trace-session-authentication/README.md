# Lab 05: Trace Session Authentication

## Goal

Trace cookie-based authentication from login through an authenticated profile request.

## Start The App

```bash
cd /Users/heavenlygetty/Documents/request-tracing-lab
source venv/bin/activate
python app.py
```

## Trace The Session In The Browser

Open:

```text
http://127.0.0.1:5000/
```

Use the session login control. In DevTools, inspect:

```text
Network > /session/login > Response Headers > Set-Cookie
Application > Cookies
Network > /session/profile > Request Headers > Cookie
```

## Log In And Store The Session Cookie With curl

```bash
curl -i \
  -c /tmp/request-tracing-session-cookie.txt \
  -H "Content-Type: application/json" \
  -H "X-Request-ID: lab-05-session-login" \
  -d '{"username":"getty","password":"cloud"}' \
  http://127.0.0.1:5000/session/login
```

## Use The Session Cookie With curl

```bash
curl -i \
  -b /tmp/request-tracing-session-cookie.txt \
  -H "X-Request-ID: lab-05-session-profile" \
  http://127.0.0.1:5000/session/profile
```

## Evidence To Collect

```text
Login response status:
Where the session cookie first appears:
Where the cookie is sent back on /session/profile:
Profile response status:
Matching Flask logs for login and profile:
Browser and curl comparison:
```

## Hint

The useful evidence is the cookie lifecycle: created by the response, stored by the client, replayed on the next authenticated request.

## Completion Standard

You are done when you can explain where the browser stored the session cookie, how `curl` stores and replays it with a cookie jar, and why both profile requests succeeded.

## Write Your Answer

Use:

```text
AnswersByGetty/phase-01-single-service-request-tracing/phase-1-observe-successful-requests/lab-05-trace-session-authentication.md
```
