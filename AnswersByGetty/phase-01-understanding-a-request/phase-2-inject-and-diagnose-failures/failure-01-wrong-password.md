# RCA: Failure 01 - Invalid Login Credentials

## Incident Summary

A login request with invalid credentials was submitted to `POST /session/login`.

The application was reachable, the route executed, and Flask returned a controlled `401 Unauthorized` response. The failure was isolated to credential validation in the application authentication layer.

## Impact

```text
User-facing symptom:
Login failed with 401 Unauthorized.

Scope:
Single request reproduced locally.

Customer impact:
The user could not authenticate with the submitted credential pair.

Service impact:
No evidence of application outage, routing failure, timeout, or unhandled exception.
```

## Request And Response

```http
POST /session/login HTTP/1.1
Host: 127.0.0.1:5000
Content-Type: application/json
X-Request-ID: failure-01-wrong-password

{
  "username": "getty",
  "password": "wrong"
}
```

```text
Status: 401 Unauthorized
Response body: Invalid credentials
```

## Timeline And Evidence

```text
2026-07-25 09:49:56,487
request_started request_id=failure-01-wrong-password method=POST path=/session/login remote_ip=127.0.0.1 user_agent=curl/8.7.1

2026-07-25 09:49:56,487
request_finished request_id=failure-01-wrong-password status=401

2026-07-25 09:49:56,487
"POST /session/login HTTP/1.1" 401
```

The same request ID appears in the request-started log, request-finished log, and client-triggered request:

```text
failure-01-wrong-password
```

This proves the request reached Flask and completed inside the application.

## Root Cause

```text
The submitted username-and-password combination did not match the credentials accepted by the application.
```

In this test, the username was expected to be valid and the password was intentionally changed to `wrong`, so the likely cause is the incorrect password.

The evidence proves the submitted credential pair was rejected. It does not independently prove which individual field was invalid.

## What Was Ruled Out

Network connectivity failure:
The client reached Flask and received an HTTP response.

Incorrect host or port:
The request was accepted by the application running at the intended address.

Missing route:
Flask matched and executed `/session/login`. A missing route would normally return `404 Not Found`.

Unsupported HTTP method:
The route accepted `POST`. An unsupported method would normally return `405 Method Not Allowed`.

General application outage:
The application processed the request and returned a controlled response.

Unhandled application exception:
The application returned `401`, not `500 Internal Server Error`.

Request timeout:
The request completed immediately and generated a `request_finished` log entry.

## Resolution

No application fix is required for this failure. The system behaved correctly by rejecting invalid credentials.

To resolve the user-facing issue, retry login with a valid username-and-password pair.

## Retained Takeaway

```text
Authentication rejection is not the same as application outage.

A request can succeed at the application-routing layer and still fail at the authentication layer. The evidence is the combination of request_started, request_finished, matching request ID, expected route, and controlled 401 response.
```
