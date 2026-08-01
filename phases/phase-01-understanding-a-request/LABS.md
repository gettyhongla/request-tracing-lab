# Phase 1 Labs

## Table Of Contents

1. [Lab 01: Establish Baseline](#lab-01-establish-baseline)
2. [Lab 02: Inspect Request In DevTools](#lab-02-inspect-request-in-devtools)
3. [Lab 03: Correlate Request Server Logs](#lab-03-correlate-request-server-logs)
4. [Lab 04: Compare GET And POST](#lab-04-compare-get-and-post)
5. [Lab 05: Trace Session Authentication](#lab-05-trace-session-authentication)
6. [Lab 06: Trace JWT Authentication](#lab-06-trace-jwt-authentication)
7. [Lab 7: Diagnose Failure Responses](#lab-7-diagnose-failure-responses)
8. [Failure 01: Wrong Password](#failure-01-wrong-password)
9. [Failure 02: Missing Session Cookie](#failure-02-missing-session-cookie)
10. [Failure 03: Invalid JWT](#failure-03-invalid-jwt)
11. [Failure 04: Expired JWT](#failure-04-expired-jwt)
12. [Failure 05: Nonexistent Route](#failure-05-nonexistent-route)
13. [Failure 06: Server Unavailable](#failure-06-server-unavailable)
14. [Failure 07: Wrong Port](#failure-07-wrong-port)
15. [Failure 08: Malformed JSON](#failure-08-malformed-json)
16. [Failure 09: Missing Content-Type](#failure-09-missing-content-type)
17. [Failure 10: Slow Request](#failure-10-slow-request)
18. [Failure 11: Application Exception](#failure-11-application-exception)
19. [Failure 12: Untrusted Certificate](#failure-12-untrusted-certificate)
20. [Lab 8: Inspect Latency And TLS](#lab-8-inspect-latency-and-tls)

## Lab 01: Establish Baseline

### Goal

Prove the Flask application is running, reachable, and returning a healthy response before changing anything or injecting failures.

### Start The App

```bash
cd /Users/heavenlygetty/Documents/request-tracing-lab
source venv/bin/activate
python app.py
```

Keep the Flask terminal visible so you can capture the matching server logs.

### Trigger The Request In The Browser

Open:

```text
http://127.0.0.1:5000/health
```

Use DevTools > Network to inspect the request and response.

### Trigger The Same Request With curl

```bash
curl -i \
  -H "X-Request-ID: lab-01-establish-baseline" \
  http://127.0.0.1:5000/health
```

### Evidence To Collect

```text
DevTools status for /health:
curl status and body:
Matching request ID in Flask logs:
Conclusion:
```

### Hint

Pay attention to whether the browser and `curl` both receive the same healthy response. The important proof is reachability plus matching server evidence, not every response header.

### Completion Standard

You are done when you can prove the browser and `curl` both reached Flask, Flask returned a healthy response, and the same request ID appears in terminal output and server logs.

### Write Your Answer

Use:

```text
AnswersByGetty/phase-01.md
```

## Lab 02: Inspect Request In DevTools

### Goal

Use browser DevTools to separate request evidence from response evidence.

### Start The App

```bash
cd /Users/heavenlygetty/Documents/request-tracing-lab
source venv/bin/activate
python app.py
```

### Trigger The Request

Open the app in a browser:

```text
http://127.0.0.1:5000/
```

Then open DevTools, go to the Network tab, refresh the page, and inspect the main document request.

### Compare With curl

Run the same request from the terminal:

```bash
curl -i \
  -H "X-Request-ID: lab-02-inspect-request-devtools" \
  http://127.0.0.1:5000/
```

### Evidence To Collect

```text
DevTools request method, URL, and status:
One request header that explains what the browser sent:
One response header or body field that explains what Flask returned:
curl status and response shape:
Browser and curl comparison:
```

### Hint

DevTools is strongest for seeing what the browser actually sent. `curl` is strongest for reproducing the same request with fewer browser-added headers.

### Completion Standard

You are done when you can explain what the browser sent, what `curl` sent, what Flask returned, and which parts of DevTools describe the request versus the response.

### Write Your Answer

Use:

```text
AnswersByGetty/phase-01.md
```

## Lab 03: Correlate Request Server Logs

### Goal

Use `X-Request-ID` to connect one client request to the matching Flask logs.

### Start The App

```bash
cd /Users/heavenlygetty/Documents/request-tracing-lab
source venv/bin/activate
python app.py
```

### Trigger The Request In The Browser

Open:

```text
http://127.0.0.1:5000/
```

Use DevTools > Network to capture the browser request, then compare it to the Flask logs.

### Trigger A Request With curl

```bash
curl -i \
  -H "X-Request-ID: lab-03-correlate-request-server-logs" \
  http://127.0.0.1:5000/health
```

### Evidence To Collect

```text
Request ID used:
Client status from browser or curl:
Matching request_started log:
Matching request_finished log:
One difference between browser and curl evidence:
Conclusion:
```

### Hint

The request ID is the anchor. Headers and user agents are useful only when they help explain why two otherwise similar requests behaved differently.

### Completion Standard

You are done when you can correlate browser evidence and `curl` evidence to Flask logs and explain how user agents, headers, and request IDs differ.

### Write Your Answer

Use:

```text
AnswersByGetty/phase-01.md
```

## Lab 04: Compare GET And POST

### Goal

Compare a read-style request with a request that submits data to the application.

### Start The App

```bash
cd /Users/heavenlygetty/Documents/request-tracing-lab
source venv/bin/activate
python app.py
```

### Trigger GET And POST In The Browser

Open the app in a browser:

```text
http://127.0.0.1:5000/
```

Use the page controls to trigger a health check and a session login. Inspect both requests in DevTools > Network.

### Trigger A GET Request With curl

```bash
curl -i \
  -H "X-Request-ID: lab-04-get-health" \
  http://127.0.0.1:5000/health
```

### Trigger A POST Request With curl

```bash
curl -i \
  -H "Content-Type: application/json" \
  -H "X-Request-ID: lab-04-post-session-login" \
  -d '{"username":"getty","password":"cloud"}' \
  http://127.0.0.1:5000/session/login
```

### Evidence To Collect

```text
GET path, status, and response purpose:
POST path, status, and submitted body:
Content-Type used for POST:
Matching Flask logs for both requests:
Browser and curl comparison:
```

### Hint

Focus on the behavioral difference: GET retrieves without a request body; POST submits data Flask must parse and validate.

### Completion Standard

You are done when you can explain how a browser-triggered request and a `curl` request express GET and POST behavior, and how Flask logs prove both request paths.

### Write Your Answer

Use:

```text
AnswersByGetty/phase-01.md
```

## Lab 05: Trace Session Authentication

### Goal

Trace cookie-based authentication from login through an authenticated profile request.

### Start The App

```bash
cd /Users/heavenlygetty/Documents/request-tracing-lab
source venv/bin/activate
python app.py
```

### Trace The Session In The Browser

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

### Log In And Store The Session Cookie With curl

```bash
curl -i \
  -c /tmp/request-tracing-session-cookie.txt \
  -H "Content-Type: application/json" \
  -H "X-Request-ID: lab-05-session-login" \
  -d '{"username":"getty","password":"cloud"}' \
  http://127.0.0.1:5000/session/login
```

### Use The Session Cookie With curl

```bash
curl -i \
  -b /tmp/request-tracing-session-cookie.txt \
  -H "X-Request-ID: lab-05-session-profile" \
  http://127.0.0.1:5000/session/profile
```

### Evidence To Collect

```text
Login response status:
Where the session cookie first appears:
Where the cookie is sent back on /session/profile:
Profile response status:
Matching Flask logs for login and profile:
Browser and curl comparison:
```

### Hint

The useful evidence is the cookie lifecycle: created by the response, stored by the client, replayed on the next authenticated request.

### Completion Standard

You are done when you can explain where the browser stored the session cookie, how `curl` stores and replays it with a cookie jar, and why both profile requests succeeded.

### Write Your Answer

Use:

```text
AnswersByGetty/phase-01.md
```

## Lab 06: Trace JWT Authentication

### Goal

Trace token-based authentication from token creation through an authenticated profile request.

### Start The App

```bash
cd /Users/heavenlygetty/Documents/request-tracing-lab
source venv/bin/activate
python app.py
```

### Trace The JWT In The Browser

Open:

```text
http://127.0.0.1:5000/
```

Use the JWT login control. In DevTools, inspect the `/jwt/login` response body and the `/jwt/profile` request headers.

### Request A JWT With curl

```bash
curl -i \
  -H "Content-Type: application/json" \
  -H "X-Request-ID: lab-06-jwt-login" \
  -d '{"username":"getty","password":"cloud"}' \
  http://127.0.0.1:5000/jwt/login
```

Copy the token from the response. Redact the token in your public notes.

### Use The JWT With curl

```bash
curl -i \
  -H "Authorization: Bearer <token>" \
  -H "X-Request-ID: lab-06-jwt-profile" \
  http://127.0.0.1:5000/jwt/profile
```

### Evidence To Collect

```text
JWT login response status:
Where the token appears:
Authorization header shape on /jwt/profile:
Profile response status:
Matching Flask logs for login and profile:
Browser and curl comparison:
```

### Hint

Do not paste full tokens into public notes. The important proof is where the token was issued and how it was presented back as `Authorization: Bearer <token>`.

### Completion Standard

You are done when you can explain how the browser sends the bearer token, how `curl` sends the same token explicitly, and which evidence proves the token was accepted.

### Write Your Answer

Use:

```text
AnswersByGetty/phase-01.md
```

## Lab 7: Diagnose Failure Responses

This lab is the failure-injection half of Phase 1.

The goal is to compare failures that look similar from the outside but happen at different layers:

```text
Bad credentials
Missing session state
Invalid token
Expired token
Unknown route
Server unavailable
Wrong port
Malformed request body
Missing Content-Type
Slow request
Application exception
TLS trust failure
```

### What To Prove

For each failure, prove:

```text
User-visible symptom:
Most important DevTools or curl evidence:
Did the request reach Flask:
Final status or client-side error:
Failed layer:
What this rules out:
```

### How To Run Each Failure

Use the browser first when the failure can be triggered from the app UI. Capture DevTools evidence from the Network tab, including request headers, response headers, status, body, timing, and cookies or authorization headers when relevant.

Then reproduce the same failure with `curl` so the terminal output can be compared against the browser evidence.

Some failures are easier to prove from the terminal, such as wrong port, server unavailable, malformed JSON, or TLS trust errors. For those, still record what the browser shows if you attempt the same request there.

Your notes should separate:

```text
User-visible symptom:
Best client-side evidence:
Best server-side evidence:
Conclusion:
```

### Hint

For failures, one strong negative signal is often as important as a positive one. For example, no Flask log usually points before Flask; a Flask `request_finished` log with `401` points to an application decision, not an outage.

### Failure Set

| Failure | Focus | Answer file |
| --- | --- | --- |
| [01](#failure-01-wrong-password) | Wrong password | `AnswersByGetty/.../failure-01-wrong-password.md` |
| [02](#failure-02-missing-session-cookie) | Missing session cookie | `AnswersByGetty/.../failure-02-missing-session-cookie.md` |
| [03](#failure-03-invalid-jwt) | Invalid JWT | `AnswersByGetty/.../failure-03-invalid-jwt.md` |
| [04](#failure-04-expired-jwt) | Expired JWT | `AnswersByGetty/.../failure-04-expired-jwt.md` |
| [05](#failure-05-nonexistent-route) | Nonexistent route | `AnswersByGetty/.../failure-05-nonexistent-route.md` |
| [06](#failure-06-server-unavailable) | Server unavailable | `AnswersByGetty/.../failure-06-server-unavailable.md` |
| [07](#failure-07-wrong-port) | Wrong port | `AnswersByGetty/.../failure-07-wrong-port.md` |
| [08](#failure-08-malformed-json) | Malformed JSON | `AnswersByGetty/.../failure-08-malformed-json.md` |
| [09](#failure-09-missing-content-type) | Missing Content-Type | `AnswersByGetty/.../failure-09-missing-content-type.md` |
| [10](#failure-10-slow-request) | Slow request | `AnswersByGetty/.../failure-10-slow-request.md` |
| [11](#failure-11-application-exception) | Application exception | `AnswersByGetty/.../failure-11-application-exception.md` |
| [12](#failure-12-untrusted-certificate) | Untrusted certificate | `AnswersByGetty/.../failure-12-untrusted-certificate.md` |

### Answer Location

Write your completed evidence and conclusions in:

```text
AnswersByGetty/phase-01.md
```

The phase folder teaches the lab. `AnswersByGetty` proves that you did the work.

## Failure 01: Wrong Password

### Scenario

Submit invalid credentials to the login endpoint.

This failure should prove the difference between:

```text
The app is down.
The request failed authentication.
```

### Start The App

```bash
cd /Users/heavenlygetty/Documents/request-tracing-lab
source venv/bin/activate
python app.py
```

Keep the Flask terminal visible.

### Trigger The Failure

In a second terminal:

```bash
curl -i \
  -H "Content-Type: application/json" \
  -H "X-Request-ID: failure-01-wrong-password" \
  -d '{"username":"getty","password":"wrong"}' \
  http://127.0.0.1:5000/session/login
```

Optional JWT comparison:

```bash
curl -i \
  -H "Content-Type: application/json" \
  -H "X-Request-ID: failure-01-wrong-password-jwt" \
  -d '{"username":"getty","password":"wrong"}' \
  http://127.0.0.1:5000/jwt/login
```

### Evidence To Collect

```text
Client status and error message:
Matching Flask logs:
Failed layer:
What this rules out:
```

### Hint

The important distinction is that Flask answered the request. A `401` with matching Flask logs points to an authentication decision, not an unavailable application.

### Completion Standard

You are done when you can explain:

```text
The request reached Flask.
Flask parsed the request.
Flask rejected the credentials intentionally.
The evidence is the 401 response plus matching request_started and request_finished logs.
```

### Write Your Answer

Use:

```text
AnswersByGetty/phase-01.md
```

## Failure 02: Missing Session Cookie

### Scenario

Request the session profile endpoint without sending the session cookie created during login.

### Trigger The Failure

```bash
curl -i \
  -H "X-Request-ID: failure-02-missing-session-cookie" \
  http://127.0.0.1:5000/session/profile
```

### Evidence To Collect

```text
Cookie evidence:
Client status and error message:
Matching Flask logs:
Failed layer:
What this rules out:
```

### Hint

Focus on whether the client sent session state. The route can be healthy while the request is still unauthorized.

### Completion Standard

You are done when you can prove the request reached Flask and was rejected because session state was missing, not because the application was unavailable.

### Write Your Answer

Use:

```text
AnswersByGetty/phase-01.md
```

## Failure 03: Invalid JWT

### Scenario

Call the JWT profile endpoint with a malformed or invalid bearer token.

### Trigger The Failure

```bash
curl -i \
  -H "Authorization: Bearer invalid.token.value" \
  -H "X-Request-ID: failure-03-invalid-jwt" \
  http://127.0.0.1:5000/jwt/profile
```

### Evidence To Collect

```text
Authorization header shape:
Client status and error message:
Matching Flask logs:
Failed layer:
What this rules out:
```

### Hint

Do not focus on the full token value. Focus on whether a bearer token was presented and how Flask classified it.

### Completion Standard

You are done when you can prove Flask received the request and rejected the bearer token as invalid.

### Write Your Answer

Use:

```text
AnswersByGetty/phase-01.md
```

## Failure 04: Expired JWT

### Scenario

Call the JWT profile endpoint with a token that is structurally valid but expired.

### Trigger The Failure

```bash
curl -i \
  -H "Authorization: Bearer <expired-token>" \
  -H "X-Request-ID: failure-04-expired-jwt" \
  http://127.0.0.1:5000/jwt/profile
```

### Evidence To Collect

```text
Token state:
Client status and error message:
Matching Flask logs:
Failed layer:
What this rules out:
```

### Hint

Expired and invalid tokens can both return `401`. The key difference is whether the token was structurally valid but rejected because its lifetime ended.

### Completion Standard

You are done when you can explain the difference between an invalid token and a valid token whose expiration time is no longer accepted.

### Write Your Answer

Use:

```text
AnswersByGetty/phase-01.md
```

## Failure 05: Nonexistent Route

### Scenario

Request a path that the Flask application does not define.

### Trigger The Failure

```bash
curl -i \
  -H "X-Request-ID: failure-05-nonexistent-route" \
  http://127.0.0.1:5000/not-a-real-route
```

### Evidence To Collect

```text
Requested path:
Client status:
Matching Flask access log:
Failed layer:
What this rules out:
```

### Hint

This is not the same as Flask being down. A `404` means the server answered, but the requested route did not match an application endpoint.

### Completion Standard

You are done when you can prove the server was reachable but the requested route did not exist.

### Write Your Answer

Use:

```text
AnswersByGetty/phase-01.md
```

## Failure 06: Server Unavailable

### Scenario

Stop Flask and send a request to the normal application port.

### Trigger The Failure

Stop the app first, then run:

```bash
curl -i \
  -H "X-Request-ID: failure-06-server-unavailable" \
  http://127.0.0.1:5000/health
```

### Evidence To Collect

```text
Client error:
HTTP response received:
Matching Flask log present:
Failed layer:
What this rules out:
```

### Hint

If no process is listening, there may be no HTTP status and no Flask log. That absence is the evidence.

### Completion Standard

You are done when you can explain the difference between a controlled HTTP error from Flask and a client-side connection failure because no service accepted the request.

### Write Your Answer

Use:

```text
AnswersByGetty/phase-01.md
```

## Failure 07: Wrong Port

### Scenario

Send the request to a port where the Flask app is not listening.

### Trigger The Failure

```bash
curl -i \
  -H "X-Request-ID: failure-07-wrong-port" \
  http://127.0.0.1:5999/health
```

### Evidence To Collect

```text
Client error:
HTTP response received:
Matching Flask log present:
Failed layer:
What this rules out:
```

### Hint

A wrong port can look like an outage from the client, but the evidence should show the request never reached the Flask listener.

### Completion Standard

You are done when you can prove the request did not reach Flask because the client targeted the wrong port.

### Write Your Answer

Use:

```text
AnswersByGetty/phase-01.md
```

## Failure 08: Malformed JSON

### Scenario

Submit a login request with a broken JSON body.

### Trigger The Failure

```bash
curl -i \
  -H "Content-Type: application/json" \
  -H "X-Request-ID: failure-08-malformed-json" \
  -d '{"username":"getty","password":' \
  http://127.0.0.1:5000/session/login
```

### Evidence To Collect

```text
Malformed input evidence:
Client status and error message:
Matching Flask logs:
Failed layer:
What this rules out:
```

### Hint

Look for the difference between request delivery and request parsing. The request can reach Flask even when the body cannot be interpreted as valid JSON.

### Completion Standard

You are done when you can explain how malformed input changes application behavior and what the response proves.

### Write Your Answer

Use:

```text
AnswersByGetty/phase-01.md
```

## Failure 09: Missing Content-Type

### Scenario

Submit a JSON-looking login body without declaring `Content-Type: application/json`.

### Trigger The Failure

```bash
curl -i \
  -H "X-Request-ID: failure-09-missing-content-type" \
  -d '{"username":"getty","password":"cloud"}' \
  http://127.0.0.1:5000/session/login
```

### Evidence To Collect

```text
Content-Type evidence:
Client status and error message:
Matching Flask logs:
Failed layer:
What this rules out:
```

### Hint

The body text may look like JSON to a human, but the application relies on request metadata to decide how to parse it.

### Completion Standard

You are done when you can explain why the body alone is not enough if the application expects JSON parsing behavior.

### Write Your Answer

Use:

```text
AnswersByGetty/phase-01.md
```

## Failure 10: Slow Request

### Scenario

Call an endpoint that intentionally delays before returning a response.

### Trigger The Failure

```bash
curl -i \
  -w "\nTotal time: %{time_total}s\n" \
  -H "X-Request-ID: failure-10-slow-request" \
  http://127.0.0.1:5000/slow
```

### Evidence To Collect

```text
Client timing:
HTTP status:
Matching Flask logs:
Slow layer:
What this rules out:
```

### Hint

A slow request is not automatically a failed request. First decide whether the response eventually succeeded, then decide where the time was spent.

### Completion Standard

You are done when you can separate a slow successful response from a timeout, outage, or unhandled exception.

### Write Your Answer

Use:

```text
AnswersByGetty/phase-01.md
```

## Failure 11: Application Exception

### Scenario

Call an endpoint that intentionally raises and logs an application error.

### Trigger The Failure

```bash
curl -i \
  -H "X-Request-ID: failure-11-application-exception" \
  http://127.0.0.1:5000/error
```

### Evidence To Collect

```text
Client status and error message:
application_error log:
request_started and request_finished logs:
Failed layer:
What this rules out:
```

### Hint

The strongest evidence is the application error log tied to the same request. That separates a handled `500` from connection, route, or auth failures.

### Completion Standard

You are done when you can prove the request reached Flask and Flask returned a controlled `500` with matching error evidence.

### Write Your Answer

Use:

```text
AnswersByGetty/phase-01.md
```

## Failure 12: Untrusted Certificate

### Scenario

Call the HTTPS version of the app with a certificate the client does not trust.

### Trigger The Failure

Start the HTTPS app mode if your local setup provides one, then run:

```bash
curl -v \
  -H "X-Request-ID: failure-12-untrusted-certificate" \
  https://127.0.0.1:5443/health
```

### Evidence To Collect

```text
Client TLS error:
HTTP response received:
Matching Flask log present:
Failed layer:
What this rules out:
```

### Hint

TLS trust failures happen before normal application evidence. If the handshake fails, the absence of a Flask request log is expected.

### Completion Standard

You are done when you can explain why the request failed before normal HTTP application handling completed.

### Write Your Answer

Use:

```text
AnswersByGetty/phase-01.md
```

## Lab 8: Inspect Latency And TLS

This lab separates slow application behavior from connection and TLS behavior.

Use this after completing the failure-response set.

### Focus

```text
Slow app response:
The request reaches Flask and returns slowly.

Connection failure:
The client cannot establish a connection to the server.

TLS trust failure:
The client reaches the TLS layer but does not trust the certificate.
```

### Evidence To Compare

Use both browser DevTools and terminal output when possible:

```text
Best timing evidence:
Client error or HTTP status:
Matching Flask log, if any:
Where the delay or failure happened:
What this rules out:
```

### Hint

Do not chase every timing field. First decide whether the client connected, whether TLS completed, whether HTTP reached Flask, and whether Flask returned slowly.

### Related Answer Files

```text
AnswersByGetty/phase-01.md
AnswersByGetty/phase-01.md
```

### Completion Standard

You are done when you can explain whether a delay or failure happened:

```text
Before TCP connection
During TLS negotiation
After HTTP reached Flask
Inside Flask application handling
```
