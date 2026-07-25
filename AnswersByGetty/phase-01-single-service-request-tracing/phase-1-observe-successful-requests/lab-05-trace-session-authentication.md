# Trace Report: Lab 05 - Trace Session Authentication

## Purpose

Trace successful session-cookie authentication from login through a protected profile request.

This trace shows how Flask creates session state, how the browser stores the session cookie, and how the browser sends that cookie back automatically on a later request.

## Login Request

```text
Method: POST
Response status: 200 OK
Request ID: 1fdfa6f9-abe1-47ab-a22a-91e0cce36f31
```

Request body:

```json
{
  "username": "getty",
  "password": "cloud"
}
```

Set-Cookie response header:

```http
Set-Cookie: session=eyJ1c2VybmFtZSI6ImdldHR5In0.amIbDg.ytZI2Baqbr7AYn3Oj8bWtqqmiKQ; HttpOnly; Path=/
```

The `POST /session/login` response instructed the browser to store the cookie by returning `Set-Cookie`.

## Stored Cookie Evidence

```text
Cookie name: session
Domain: 127.0.0.1
Path: /
HttpOnly: Checked
Secure: Blank
SameSite: Blank
Expiration: Session
```

Cookie attributes affect when JavaScript or the browser can use the cookie:

```text
HttpOnly:
Prevents JavaScript from reading the cookie. The browser can still send it.

Secure:
Only sends the cookie over HTTPS.

Path:
Controls which URL paths receive the cookie.

Domain:
Controls which host or domain receives the cookie.

SameSite:
Controls whether the cookie is sent with cross-site requests.

Expiration / Max-Age:
Controls how long the cookie lasts. Session cookies last until the browser session ends.
```

## Protected Request

Cookie request header:

```http
Cookie: session=eyJ1c2VybmFtZSI6ImdldHR5In0...
```

```text
Method: GET
Path: /session/profile
Response status: 200 OK
Request ID: 210dae52-495f-495c-8eeb-1b8dbef54761
```

Response body:

```json
{
  "authentication": "session cookie",
  "request_id": "210dae52-495f-495c-8eeb-1b8dbef54761",
  "username": "getty"
}
```

Server evidence:

```text
2026-07-23 10:46:45,355 INFO request_started request_id=210dae52-495f-495c-8eeb-1b8dbef54761 method=GET path=/session/profile remote_ip=127.0.0.1 user_agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
2026-07-23 10:46:45,355 INFO request_finished request_id=210dae52-495f-495c-8eeb-1b8dbef54761 status=200
2026-07-23 10:46:45,356 INFO 127.0.0.1 - - [23/Jul/2026 10:46:45] "GET /session/profile HTTP/1.1" 200 -
```

## Trace Summary

```text
POST /session/login
Client sends JSON credentials:
{"username":"getty","password":"cloud"}

        |
        v

Flask validates credentials
Creates session data
Returns 200 OK

Response includes:
Set-Cookie: session=...; HttpOnly; Path=/

        |
        v

Browser stores session cookie

        |
        v

GET /session/profile
Browser automatically sends:
Cookie: session=...

        |
        v

Flask reads session cookie
Recognizes username=getty
Returns profile JSON

        |
        v

200 OK
{
  "authentication": "session cookie",
  "username": "getty",
  "request_id": "..."
}
```

## What This Confirms

The session was created when the browser sent `POST /session/login` with valid JSON credentials and Flask returned a `Set-Cookie` response header.

The browser proved it stored the session because the session cookie appeared in DevTools under Application > Cookies, and the later `/session/profile` request included a `Cookie` request header.

The server recognized the later request because the browser automatically sent the session cookie with `GET /session/profile`, allowing Flask to identify the logged-in user without sending the username and password again.

## Retained Takeaway

```text
Set-Cookie:
Response header from the server that tells the browser to store a cookie.

Cookie:
Request header from the browser that sends a stored cookie back to the server.

Session cookie:
Proof that the browser has login state for later matching requests.

X-Request-ID:
Tracing value used to connect one browser response with its server logs.
```

Cookies are mostly about state and identity. Cache is mostly about performance.

Phase 2 bridge:
When NGINX is introduced, confirm whether cookie headers are forwarded correctly before blaming Flask or the database.
