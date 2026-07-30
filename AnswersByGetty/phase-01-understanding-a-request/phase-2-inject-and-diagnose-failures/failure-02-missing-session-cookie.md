# RCA: Failure 02 - Missing Session Cookie

## Incident Summary

A request was sent to the session-protected profile endpoint without a session cookie.

The application was reachable, the protected route executed, and Flask returned a controlled `401 Unauthorized` response. The failure was isolated to missing or invalid session state.

## Impact

```text
User-facing symptom:
The profile request failed with 401 Unauthorized.

Scope:
Single request reproduced locally.

Customer impact:
The user could not access the session-protected profile endpoint.

Service impact:
No evidence of application outage, routing failure, timeout, method mismatch, or unhandled exception.
```

## Request And Response

```http
GET /session/profile HTTP/1.1
Host: 127.0.0.1:5000
X-Request-ID: failure-02-missing-session-cookie
```

Request details:

```text
Method: GET
Path: /session/profile
Cookie header present: No
Client-supplied request ID: failure-02-missing-session-cookie
```

Response:

```text
Status: 401 Unauthorized
Content-Type: application/json
X-Request-ID: failure-02-missing-session-cookie
Vary: Cookie
```

```json
{
  "error": "session missing or expired",
  "request_id": "failure-02-missing-session-cookie"
}
```

## Timeline And Evidence

```text
2026-07-25 10:15:47,780
request_started request_id=failure-02-missing-session-cookie method=GET path=/session/profile remote_ip=127.0.0.1 user_agent=curl/8.7.1

2026-07-25 10:15:47,780
request_finished request_id=failure-02-missing-session-cookie status=401

2026-07-25 10:15:47,780
"GET /session/profile HTTP/1.1" 401
```

The same request ID appears in the client response and Flask logs:

```text
failure-02-missing-session-cookie
```

This proves the client-visible `401` maps to the server-side request that Flask received and completed.

## Root Cause

```text
The request did not include a valid session cookie, so the application could not identify an authenticated session.
```

The response body says `session missing or expired`, which matches the missing-cookie condition. The `Vary: Cookie` response header also confirms cookie state is relevant to this route's response behavior.

## What Was Ruled Out

Network connectivity failure:
The client reached Flask and received an HTTP response.

Incorrect host or port:
The request was accepted by the application running at `127.0.0.1:5000`.

Missing route:
Flask handled `/session/profile`. A missing route would normally return `404 Not Found`.

Unsupported HTTP method:
The route accepted `GET`. An unsupported method would normally return `405 Method Not Allowed`.

General application outage:
The application processed the request and returned a controlled JSON response.

Unhandled application exception:
The application returned `401`, not `500 Internal Server Error`.

Invalid password:
This request did not submit credentials. The failure happened because the protected endpoint did not receive valid session state.

## Resolution

No application fix is required for this failure. The system behaved correctly by blocking access to a session-protected route when no valid session cookie was provided.

To resolve the user-facing issue, sign in again or resend the request with the session cookie created during login.

## Retained Takeaway

```text
A missing session cookie is not the same as application outage.

The request reached Flask, the protected route executed, and the application intentionally returned 401 because the client did not provide valid session state.
```
