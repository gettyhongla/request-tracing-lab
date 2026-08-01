# Phase 1 Answers

This document preserves completed learner evidence that previously lived in smaller answer files.

## Phase 1 Answers: Understanding a Request

## Phase 1 Answers: Understanding a Request

These answers capture the completed Phase 1 request-tracing work.

Read them for structure:

```text
Observation -> Evidence -> Conclusion -> Takeaway
```

### Completed Answers

```text
phase-1-observe-successful-requests/lab-01-establish-baseline.md
phase-1-observe-successful-requests/lab-02-inspect-request-devtools.md
phase-1-observe-successful-requests/lab-03-correlate-request-server-logs.md
phase-1-observe-successful-requests/lab-04-compare-get-and-post.md
phase-1-observe-successful-requests/lab-05-trace-session-authentication.md
phase-1-observe-successful-requests/lab-06-trace-jwt-authentication.md
```

### Phase 1 Concepts To Retain

```text
Request evidence:
Method, path, headers, body, cookies, authorization, and request ID.

Response evidence:
Status, headers, body, cookies set by the server, and request ID.

Server evidence:
request_started, request_finished, status, path, duration, and application errors.

Authentication evidence:
Cookies are automatically returned by the browser. JWTs must be explicitly sent in the Authorization header.

Correlation evidence:
X-Request-ID connects client-side observations to server-side logs.

Phase 2 bridge:
When NGINX, PostgreSQL, and Redis are added, the same evidence discipline expands across more layers.
```

### Failure Answers

```text
phase-2-inject-and-diagnose-failures/failure-01-wrong-password.md
phase-2-inject-and-diagnose-failures/failure-02-missing-session-cookie.md
phase-2-inject-and-diagnose-failures/failure-03-invalid-jwt.md
phase-2-inject-and-diagnose-failures/failure-04-expired-jwt.md
phase-2-inject-and-diagnose-failures/failure-05-nonexistent-route.md
phase-2-inject-and-diagnose-failures/failure-06-server-unavailable.md
phase-2-inject-and-diagnose-failures/failure-07-wrong-port.md
phase-2-inject-and-diagnose-failures/failure-08-malformed-json.md
phase-2-inject-and-diagnose-failures/failure-09-missing-content-type.md
phase-2-inject-and-diagnose-failures/failure-10-slow-request.md
phase-2-inject-and-diagnose-failures/failure-11-application-exception.md
phase-2-inject-and-diagnose-failures/failure-12-untrusted-certificate.md
```

For each failure, the answer should show the triggered symptom, client evidence, server evidence if the request reaches Flask, conclusion, and retained takeaway.

## Trace Report: Lab 01 - Establish Baseline

## Trace Report: Lab 01 - Establish Baseline

### Purpose

Establish known-good behavior for the Flask application before introducing failures.

This baseline proves that the browser can reach the app, the `/health` route works, Flask returns a normal HTTP response, and server logs can be matched to client-side evidence.

### Request

```text
Method: GET
Path: /health
```

### Response

```text
Status: 200 OK
```

```json
{
  "status": "healthy",
  "timestamp": "2026-07-23T11:33:06.269340+00:00"
}
```

The `200 OK` status confirms that the request succeeded. The client reached Flask, the `/health` route handled the request, and the server returned a normal JSON response.

### Server Evidence

```text
request_started request_id=65656b60-5833-42c4-80a8-cd71f48492c8 method=GET path=/health remote_ip=127.0.0.1 user_agent=...
request_finished request_id=65656b60-5833-42c4-80a8-cd71f48492c8 status=200
"GET /health HTTP/1.1" 200
```

### Trace Summary

```text
Browser
  |
  | GET /health
  v
Flask application
  |
  | request_started
  | request_finished status=200
  v
Browser receives 200 OK JSON health response
```

### What This Confirms

```text
Client evidence:
The browser received an HTTP response.

Protocol evidence:
The response status was 200 OK.

Application evidence:
The response body reported "healthy" and included a UTC timestamp.

Server evidence:
The Flask logs showed request_started and request_finished for GET /health.
```

The Flask application is running, the browser can reach it at `127.0.0.1:5000`, the `/health` route works, and client-side evidence can be matched with server-side logs.

### Retained Takeaway

```text
A known-good baseline shows what success looks like before failures are introduced.
```

Later failures can be compared against this baseline to identify what changed: method, path, headers, body, status code, response body, timing, or server logs.

Phase 2 bridge:
Before adding NGINX, PostgreSQL, or Redis, capture healthy behavior so later failures can be compared against known-good request flow.

## Trace Report: Lab 02 - Inspect A Request In DevTools

## Trace Report: Lab 02 - Inspect A Request In DevTools

### Purpose

Separate request evidence from response evidence using browser DevTools.

This trace shows what the browser sent to Flask, what Flask returned, and which value can be used to correlate browser evidence with server logs.

### Request

```text
Request URL: http://127.0.0.1:5000/health
Method: GET
Remote address: 127.0.0.1:5000
Request body: None
```

Request headers:

```text
Host: 127.0.0.1:5000
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
Accept: */*
Connection: keep-alive
```

The `Host` header identifies the destination host. The `User-Agent` header identifies the client software, which was Chrome on macOS.

### Response

```text
Status: 200 OK
Content-Type: application/json
Content-Length: 77
X-Request-ID: c6360e43-e202-4a71-b511-28707e351f18
```

Response body:

```json
{
  "status": "healthy",
  "timestamp": "2026-07-23T12:06:35.921265+00:00"
}
```

The server returned JSON. The `Content-Type: application/json` response header confirms the response format.

### Trace Summary

```text
Browser sends:
GET /health with request headers and no request body.

Flask returns:
200 OK with JSON content, response headers, and X-Request-ID.
```

The `X-Request-ID` response header is the strongest tracing value because it can be matched against `request_id` in Flask logs.

### What This Confirms

```text
Request:
What the client sends.

Response:
What the server returns.

Request body:
Data sent by the client. This GET request did not have one.

Response body:
Data returned by the server. In this lab, it was JSON.

X-Request-ID:
The main correlation value between DevTools and Flask logs.
```

### Retained Takeaway

GET `/health` retrieved information without sending a body. The JSON object with `"status": "healthy"` was the response body, not the request body.

OSI context:
These are HTTP details at the application layer. Lower layers still matter when DNS, TCP, TLS, or routing fails.

Phase 2 bridge:
When a reverse proxy is added, compare browser evidence with proxy evidence and application evidence instead of assuming one layer tells the whole story.

## Trace Report: Lab 03 - Correlate A Request With Server Logs

## Trace Report: Lab 03 - Correlate A Request With Server Logs

### Purpose

Use `X-Request-ID` to connect client-side browser evidence to Flask server logs.

This trace proves that the same request can be followed from DevTools into the application log by matching the request ID, method, path, timestamp, and status code.

### Request And Response

```text
Method: GET
Path: /health
Status: 200
Request ID: c4d27ee1-55a4-4637-9876-5cc385890fff
```

The request ID first appeared in DevTools as the `X-Request-ID` response header for the `/health` request.

### Server Evidence

```text
2026-07-23 09:05:25,609 INFO request_started request_id=c4d27ee1-55a4-4637-9876-5cc385890fff method=GET path=/health remote_ip=127.0.0.1 user_agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36

2026-07-23 09:05:25,609 INFO request_finished request_id=c4d27ee1-55a4-4637-9876-5cc385890fff status=200
```

The same request ID appeared in both `request_started` and `request_finished`:

```text
request_id=c4d27ee1-55a4-4637-9876-5cc385890fff
```

### Trace Summary

```text
Client: Chrome browser
  |
  | GET /health
  | X-Request-ID returned: c4d27ee1-55a4-4637-9876-5cc385890fff
  v
Flask application
  |
  | request_started request_id=c4d27ee1-55a4-4637-9876-5cc385890fff method=GET path=/health
  | request_finished request_id=c4d27ee1-55a4-4637-9876-5cc385890fff status=200
  v
Client: 200 OK JSON health response
```

### What This Confirms

The `X-Request-ID` value from the browser response matched the `request_id` value in the Flask server logs.

The request log also recorded method, path, remote IP address, and user agent. The user agent identified the client as Chrome on macOS.

The evidence that both records represent the same request is:

```text
Matching request ID
Consistent method: GET
Consistent path: /health
Consistent status: 200
Consistent timestamp window
```

### Retained Takeaway

```text
X-Request-ID:
The correlation key across client and server evidence.

request_started:
Proves the request reached the Flask app and records method, path, remote IP, and user agent.

request_finished:
Proves the app finished handling the request and records the final status.
```

A strong operational note includes request ID, timestamp, route, status, user impact, and matching logs.

Phase 2 bridge:
In a layered system, this same request ID should appear in proxy logs, application logs, and dependency telemetry so one user action can be traced end to end.

## Trace Report: Lab 04 - Compare GET And POST

## Trace Report: Lab 04 - Compare GET And POST

### Purpose

Compare a successful `GET` request with a successful `POST` request.

This trace shows the difference between retrieving information and submitting information, and why method, body, content type, and cookies matter when interpreting request behavior.

### GET Request

```text
Method: GET
Path: /health
Request Content-Type: None observed
Request body: None
Response status: 200 OK
```

`GET /health` retrieved information from the server. It did not send a request body, so it did not need a request `Content-Type`.

### POST Request

```text
Method: POST
Path: /session/login
Content-Type: application/json
Response status: 200 OK
```

Request body:

```json
{
  "username": "getty",
  "password": "cloud"
}
```

Response body:

```json
{
  "message": "session login successful",
  "request_id": "f9018f3b-d1c6-4006-ba34-5193d9e8fd11"
}
```

`POST /session/login` submitted JSON credentials and created login state.

### Comparison

| Question | `/health` | `/session/login` |
| --- | --- | --- |
| HTTP method | GET | POST |
| Purpose | Retrieve application health data | Submit credentials and create login state |
| Request body present? | No | Yes |
| Request content type | None observed | `application/json` |
| Creates login state? | No | Yes |
| Response status | 200 OK | 200 OK with correct credentials |

### Reproduced Request Evidence

Copied browser request:

```text
URL: http://127.0.0.1:5000/session/login
Method: POST, implied by --data-raw
```

In `curl`, `--data`, `--data-raw`, and `-d` automatically send a `POST` request unless another method is specified.

Headers:

```http
Accept: */*
Accept-Language: en-US,en;q=0.9
Cache-Control: no-cache
Connection: keep-alive
Content-Type: application/json
Origin: http://127.0.0.1:5000
Pragma: no-cache
Referer: http://127.0.0.1:5000/
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
X-Client-Name: browser-lab
```

Request body:

```json
{"username":"getty","password":"cloud"}
```

Cookies, if present:

```http
session=eyJ1c2VybmFtZSI6ImdldHR5In0...
```

### What This Confirms

```text
GET:
Used here to retrieve health data. No request body was sent.

POST:
Used here to submit credentials. POST does not always create a database resource.

Content-Type:
Tells the server how to parse the request body.

curl --data-raw:
Makes curl send a POST request unless another method is specified.

Copied browser cookies:
If copied curl includes -b, curl is sending browser cookie state with the request.
```

### Retained Takeaway

GET `/health` retrieved information without a request body. POST `/session/login` submitted a JSON request body containing credentials and created login state.

Phase 2 bridge:
When NGINX and PostgreSQL are added, method, body, content type, and cookies still determine what the application can safely parse and process.

## Trace Report: Lab 05 - Trace Session Authentication

## Trace Report: Lab 05 - Trace Session Authentication

### Purpose

Trace successful session-cookie authentication from login through a protected profile request.

This trace shows how Flask creates session state, how the browser stores the session cookie, and how the browser sends that cookie back automatically on a later request.

### Login Request

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

### Stored Cookie Evidence

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

### Protected Request

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

### Trace Summary

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

### What This Confirms

The session was created when the browser sent `POST /session/login` with valid JSON credentials and Flask returned a `Set-Cookie` response header.

The browser proved it stored the session because the session cookie appeared in DevTools under Application > Cookies, and the later `/session/profile` request included a `Cookie` request header.

The server recognized the later request because the browser automatically sent the session cookie with `GET /session/profile`, allowing Flask to identify the logged-in user without sending the username and password again.

### Retained Takeaway

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

## Trace Report: Lab 06 - Trace JWT Authentication

## Trace Report: Lab 06 - Trace JWT Authentication

### Purpose

Trace successful JWT authentication from token issuance through a protected profile request.

This trace shows where the JWT first appears, how the client sends it back, and how JWT authentication differs from session-cookie authentication.

### Token Request

```text
Method: POST
Path: /jwt/login
Response status: 200 OK
Request ID: f6d175c8-e795-451a-86e9-4b1c353320dc
```

Request body:

```json
{
  "username": "getty",
  "password": "cloud"
}
```

Response body:

```json
{
  "token": "<redacted-jwt>",
  "request_id": "f6d175c8-e795-451a-86e9-4b1c353320dc"
}
```

The JWT first appeared in the response body from `POST /jwt/login`.

### Protected Request

Authorization header:

```http
Authorization: Bearer <redacted-jwt>
```

```text
Method: GET
Path: /jwt/profile
Response status: 200 OK
Request ID: f64d214f-d50e-4d56-9b40-772fd980368f
```

Response body:

```json
{
  "authentication": "JWT",
  "request_id": "f64d214f-d50e-4d56-9b40-772fd980368f",
  "role": "customer",
  "username": "getty"
}
```

Server evidence:

```text
2026-07-23 11:32:37,887 INFO request_started request_id=f64d214f-d50e-4d56-9b40-772fd980368f method=GET path=/jwt/profile remote_ip=127.0.0.1 user_agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
2026-07-23 11:32:37,888 INFO request_finished request_id=f64d214f-d50e-4d56-9b40-772fd980368f status=200
2026-07-23 11:32:37,888 INFO 127.0.0.1 - - [23/Jul/2026 11:32:37] "GET /jwt/profile HTTP/1.1" 200 -
```

### Trace Summary

```text
POST /jwt/login
Client sends JSON credentials
        |
        v
Flask validates credentials
Returns token in response body
        |
        v
Client stores token in frontend state
        |
        v
GET /jwt/profile
Client sends Authorization: Bearer <redacted-jwt>
        |
        v
Flask validates token
Returns JWT-authenticated profile response
```

The browser did not attach the JWT automatically as a cookie. In this lab, frontend JavaScript manually added it to the `Authorization` header.

The `viewJwtProfile()` JavaScript function added the header:

```js
headers: {
  "Authorization": `Bearer ${jwtToken}`
}
```

### Compare Authentication Methods

| Question | Session cookie | JWT |
| --- | --- | --- |
| Returned by the server? | Yes | Yes |
| Stored by the browser automatically? | Yes | No, not in this lab |
| Sent automatically? | Yes | No |
| Sent in which header? | `Cookie` | `Authorization` |
| Requires client-side code in this lab? | No | Yes |
| Can expire? | Yes | Yes |

### What This Confirms

Session authentication relied on a session cookie that the browser stored and automatically sent back to the server.

JWT authentication relied on a bearer token returned by `/jwt/login` and explicitly added to the `Authorization` header for `/jwt/profile`.

Possessing a token means the client has a token string. Proving it is valid means the server verifies the token's signature, expiration, algorithm, and claims.

Passwords, private keys, API keys, secrets, sensitive personal data, or anything that should not be exposed must not be included in a JWT payload. JWT payloads are encoded, not encrypted.

### Retained Takeaway

```text
JWT:
JSON Web Token.

JWT bearer auth:
The app receives a token and must explicitly send it in the Authorization header.

Bearer token:
Whoever holds the token can attempt to use it, so tokens should be protected and redacted.

JWT validation:
The server must verify the token signature, expiration, algorithm, and claims.

X-Request-ID:
Traces the request, but does not authenticate anyone.
```

A JWT has three dot-separated parts:

```text
header.payload.signature
```

Phase 2 bridge:
When NGINX is introduced, verify that the `Authorization` header reaches Flask before assuming the token itself is invalid.

## RCA: Failure 01 - Invalid Login Credentials

## RCA: Failure 01 - Invalid Login Credentials

### Incident Summary

A login request with invalid credentials was submitted to `POST /session/login`.

The application was reachable, the route executed, and Flask returned a controlled `401 Unauthorized` response. The failure was isolated to credential validation in the application authentication layer.

### Impact

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

### Request And Response

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

### Timeline And Evidence

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

### Root Cause

```text
The submitted username-and-password combination did not match the credentials accepted by the application.
```

In this test, the username was expected to be valid and the password was intentionally changed to `wrong`, so the likely cause is the incorrect password.

The evidence proves the submitted credential pair was rejected. It does not independently prove which individual field was invalid.

### What Was Ruled Out

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

### Resolution

No application fix is required for this failure. The system behaved correctly by rejecting invalid credentials.

To resolve the user-facing issue, retry login with a valid username-and-password pair.

### Retained Takeaway

```text
Authentication rejection is not the same as application outage.

A request can succeed at the application-routing layer and still fail at the authentication layer. The evidence is the combination of request_started, request_finished, matching request ID, expected route, and controlled 401 response.
```

## RCA: Failure 02 - Missing Session Cookie

## RCA: Failure 02 - Missing Session Cookie

### Incident Summary

A request was sent to the session-protected profile endpoint without a session cookie.

The application was reachable, the protected route executed, and Flask returned a controlled `401 Unauthorized` response. The failure was isolated to missing or invalid session state.

### Impact

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

### Request And Response

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

### Timeline And Evidence

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

### Root Cause

```text
The request did not include a valid session cookie, so the application could not identify an authenticated session.
```

The response body says `session missing or expired`, which matches the missing-cookie condition. The `Vary: Cookie` response header also confirms cookie state is relevant to this route's response behavior.

### What Was Ruled Out

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

### Resolution

No application fix is required for this failure. The system behaved correctly by blocking access to a session-protected route when no valid session cookie was provided.

To resolve the user-facing issue, sign in again or resend the request with the session cookie created during login.

### Retained Takeaway

```text
A missing session cookie is not the same as application outage.

The request reached Flask, the protected route executed, and the application intentionally returned 401 because the client did not provide valid session state.
```

## Failure 03: Invalid JWT

## Failure 03: Invalid JWT

### Scenario

Call `GET /jwt/profile` with a malformed or invalid bearer token.

### Trigger

```bash
curl -i \
  -H "Authorization: Bearer invalid.token.value" \
  -H "X-Request-ID: failure-03-invalid-jwt" \
  http://127.0.0.1:5000/jwt/profile
```

### Record

```text
Request method:
Request path:
Authorization header:
Response status:
Response body:
X-Request-ID:
Matching server log:
```

### Conclusion

```text
What failed:
Failed layer:
Evidence:
What this rules out:
What I would tell engineering:
```

### Key Takeaway

```text
JWT failures require checking whether the token was missing, malformed, expired, or rejected by signature validation.
```

## Failure 04: Expired JWT

## Failure 04: Expired JWT

### Scenario

Call `GET /jwt/profile` with a token that is structurally valid but expired.

### Trigger

```bash
curl -i \
  -H "Authorization: Bearer <expired-token>" \
  -H "X-Request-ID: failure-04-expired-jwt" \
  http://127.0.0.1:5000/jwt/profile
```

### Record

```text
Request method:
Request path:
Authorization header:
Token expiration:
Response status:
Response body:
X-Request-ID:
Matching server log:
```

### Conclusion

```text
What failed:
Failed layer:
Evidence:
What this rules out:
What I would tell engineering:
```

### Key Takeaway

```text
An expired JWT can prove the client had a token but the application rejected it because its validity window had passed.
```

## Failure 05: Nonexistent Route

## Failure 05: Nonexistent Route

### Scenario

Call a route that the Flask application does not define.

### Trigger

```bash
curl -i \
  -H "X-Request-ID: failure-05-nonexistent-route" \
  http://127.0.0.1:5000/not-a-real-route
```

### Record

```text
Request method:
Request path:
Response status:
Response body:
X-Request-ID:
Matching server log:
```

### Conclusion

```text
What failed:
Failed layer:
Evidence:
What this rules out:
What I would tell engineering:
```

### Key Takeaway

```text
A 404 proves the server was reachable but the requested route did not exist.
```

## Failure 06: Server Unavailable

## Failure 06: Server Unavailable

### Scenario

Call the application while the Flask server is not running.

### Trigger

```bash
curl -i \
  -H "X-Request-ID: failure-06-server-unavailable" \
  http://127.0.0.1:5000/health
```

### Record

```text
Request method:
Request path:
Response or curl error:
X-Request-ID:
Matching server log:
Was Flask running?
```

### Conclusion

```text
What failed:
Failed layer:
Evidence:
What this rules out:
What I would tell engineering:
```

### Key Takeaway

```text
If Flask is unavailable, there may be no application log for the request. Absence of server evidence can itself be evidence.
```

## Failure 07: Wrong Port

## Failure 07: Wrong Port

### Scenario

Call the right host but the wrong local port.

### Trigger

```bash
curl -i \
  -H "X-Request-ID: failure-07-wrong-port" \
  http://127.0.0.1:5999/health
```

### Record

```text
Request method:
Request path:
Port used:
Response or curl error:
X-Request-ID:
Matching server log:
```

### Conclusion

```text
What failed:
Failed layer:
Evidence:
What this rules out:
What I would tell engineering:
```

### Key Takeaway

```text
A wrong port fails before the request reaches Flask, so the client error and missing app log are both important evidence.
```

## Failure 08: Malformed JSON

## Failure 08: Malformed JSON

### Scenario

Send invalid JSON to a route that expects a JSON body.

### Trigger

```bash
curl -i \
  -H "Content-Type: application/json" \
  -H "X-Request-ID: failure-08-malformed-json" \
  -d '{"username":"getty","password":' \
  http://127.0.0.1:5000/session/login
```

### Record

```text
Request method:
Request path:
Content-Type:
Request body:
Response status:
Response body:
X-Request-ID:
Matching server log:
```

### Conclusion

```text
What failed:
Failed layer:
Evidence:
What this rules out:
What I would tell engineering:
```

### Key Takeaway

```text
Malformed request bodies can look like auth failures if the app silently fails to parse input. Check the request payload and parsing behavior before assuming credentials are wrong.
```

## Failure 09: Missing Content Type

## Failure 09: Missing Content Type

### Scenario

Send a JSON body without declaring `Content-Type: application/json`.

### Trigger

```bash
curl -i \
  -H "X-Request-ID: failure-09-missing-content-type" \
  -d '{"username":"getty","password":"cloud"}' \
  http://127.0.0.1:5000/session/login
```

### Record

```text
Request method:
Request path:
Content-Type:
Request body:
Response status:
Response body:
X-Request-ID:
Matching server log:
```

### Conclusion

```text
What failed:
Failed layer:
Evidence:
What this rules out:
What I would tell engineering:
```

### Key Takeaway

```text
Content-Type tells the application how to parse the body. A valid-looking payload can still fail if the server does not treat it as JSON.
```

## Failure 10: Slow Request

## Failure 10: Slow Request

### Scenario

Call an endpoint that intentionally responds slowly.

### Trigger

```bash
curl -i \
  -H "X-Request-ID: failure-10-slow-request" \
  http://127.0.0.1:5000/slow
```

### Record

```text
Request method:
Request path:
Client duration:
Response status:
Response body:
X-Request-ID:
Matching server log:
```

### Conclusion

```text
What failed:
Failed layer:
Evidence:
What this rules out:
What I would tell engineering:
```

### Key Takeaway

```text
Latency is not always failure. A slow successful response still needs timing evidence so the time spent can be located.
```

## Failure 11: Application Exception

## Failure 11: Application Exception

### Scenario

Call an endpoint that intentionally raises an application error.

### Trigger

```bash
curl -i \
  -H "X-Request-ID: failure-11-application-exception" \
  http://127.0.0.1:5000/error
```

### Record

```text
Request method:
Request path:
Response status:
Response body:
X-Request-ID:
Matching server log:
Exception evidence:
```

### Conclusion

```text
What failed:
Failed layer:
Evidence:
What this rules out:
What I would tell engineering:
```

### Key Takeaway

```text
A 500 means the request reached the application and the application failed while handling it.
```

## Failure 12: Untrusted Certificate

## Failure 12: Untrusted Certificate

### Scenario

Call the HTTPS version of the app with a certificate the client does not trust.

### Trigger

```bash
curl -v \
  -H "X-Request-ID: failure-12-untrusted-certificate" \
  https://127.0.0.1:5443/health
```

### Record

```text
Request method:
Request path:
TLS error:
Response status:
X-Request-ID:
Matching server log:
Certificate evidence:
```

### Conclusion

```text
What failed:
Failed layer:
Evidence:
What this rules out:
What I would tell engineering:
```

### Key Takeaway

```text
TLS trust failures can happen before HTTP reaches the app. Separate certificate negotiation from application behavior.
```
