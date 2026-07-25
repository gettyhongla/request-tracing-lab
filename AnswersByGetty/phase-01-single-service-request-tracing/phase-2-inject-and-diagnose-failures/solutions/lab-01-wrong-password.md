# Solution: Failure 01 - Invalid Login Credentials

## Scenario

A login request with invalid credentials was submitted to the session authentication endpoint.

The investigation goal was to determine whether the failure happened before the request reached the application, or inside the application's authentication logic.

## Request

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

Request details:

```text
Method: POST
Path: /session/login
Content type: application/json
Client-supplied request ID: failure-01-wrong-password
```

## Response

```text
Status: 401 Unauthorized
Response body: Invalid credentials
```

A `401 Unauthorized` response means the application received the authentication request but did not accept the submitted credentials.

## Server Evidence

```text
2026-07-25 09:49:56,487 INFO request_started request_id=failure-01-wrong-password method=POST path=/session/login remote_ip=127.0.0.1 user_agent=curl/8.7.1

2026-07-25 09:49:56,487 INFO request_finished request_id=failure-01-wrong-password status=401

2026-07-25 09:49:56,487 INFO 127.0.0.1 - - [25/Jul/2026 09:49:56] "POST /session/login HTTP/1.1" 401 -
```

Correlation evidence:

```text
failure-01-wrong-password
```

The same request ID appears in both the `request_started` and `request_finished` log entries. That confirms the client request was received and processed by the Flask application.

## Evidence-Based Analysis

Observed behavior:

```text
The client connected to the application.
The client submitted a POST request to /session/login.
Flask received the request.
Flask executed the matching route.
Flask evaluated the submitted credentials.
Flask returned a controlled 401 Unauthorized response.
```

Failed layer:

```text
Application authentication layer
```

Root cause:

```text
The submitted username-and-password combination did not match the credentials accepted by the application.
```

In this test, the username was expected to be valid and the password was intentionally changed to `wrong`. Therefore, the likely cause is the incorrect password.

The response and logs only prove that the submitted credential pair was rejected. They do not independently prove which individual field was invalid.

## Evidence

1. The application logged a request to the expected route:

   ```text
   method=POST path=/session/login
   ```

2. The application used the same request ID throughout processing:

   ```text
   request_id=failure-01-wrong-password
   ```

3. A `request_finished` event was recorded, showing that application processing completed:

   ```text
   status=401
   ```

4. The Flask access log confirms that the route returned an HTTP response:

   ```text
   "POST /session/login HTTP/1.1" 401
   ```

5. The response was a deliberate authentication rejection, not an unhandled application exception or connection failure.

## What This Rules Out

Network connectivity failure:
The client reached the Flask server and received an HTTP response.

Incorrect host or port:
The request was accepted by the application running at the intended address.

Missing route:
Flask matched and executed `/session/login`. A missing route would normally return `404 Not Found`.

Unsupported HTTP method:
The route accepted the `POST` request. An unsupported method would normally return `405 Method Not Allowed`.

General application outage:
The application was running, processed the request, and returned a controlled response.

Unhandled application exception:
The application returned `401`, not an unexpected `500 Internal Server Error`.

Request timeout:
The request completed immediately and generated a `request_finished` log entry.

## Customer-Facing Explanation

The application was available and successfully received the login request.

The submitted credentials were not accepted, so the application returned `401 Unauthorized`. This was an authentication failure rather than a service outage or connectivity issue.

## Engineering Escalation Note

```text
A POST request to /session/login was received and completed by the Flask application.

Correlation ID:
failure-01-wrong-password

Observed response:
401 Unauthorized

The request_started, request_finished, and access-log entries confirm that the request reached the expected route and completed normally.

The failure is isolated to credential validation in the application authentication layer. No evidence indicates a network, routing, availability, timeout, or unhandled application error.
```

## Key Takeaway

```text
An authentication rejection is not the same as an application outage.

The request reached Flask, the correct route executed, and the application intentionally returned 401 because the submitted credentials were not accepted.
```
