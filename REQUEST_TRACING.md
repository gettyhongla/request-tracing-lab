# Request Tracing and Failure Diagnosis Exercises

Use this workbook to practice tracing requests, inspecting evidence, and diagnosing failures.

Complete the exercises in order:

```text
Phase 1: Observe successful requests
Phase 2: Inject and diagnose failures
```

Do not begin by reading `ANSWERS/`. After completing these exercises, continue with `ARCHITECTURE.md`.

Investigate the behavior first, record what you observe, and support every conclusion with evidence.

---

# Before You Begin

## Start the application

Activate your virtual environment and run:

```bash
python app.py
```

Open the application:

```text
http://127.0.0.1:5000
```

Keep the terminal running Flask visible while completing the exercises.

You will use two views of the same request:

```text
Client-side view
Browser DevTools or curl

Server-side view
Flask application logs
```

---

## Open Chrome DevTools

In Chrome:

```text
Right-click the page
→ Inspect
→ Network
```

Enable:

```text
Preserve log
Disable cache
```

You will frequently inspect:

```text
Headers
Payload
Response
Cookies
Timing
```

---

# Investigation Notes

Use this short worksheet for each request.

```text
Scenario:

Tool used:

Request method:

Request path:

Important request headers:

Request body:

Response status:

Important response headers:

Response body:

Request ID:

Matching server log:

Observed behavior:

Failure layer, if applicable:

Evidence:

Next troubleshooting step:
```

---

# Phase 1: Observe Successful Requests

The first phase establishes normal behavior.

Before diagnosing failures, learn what a successful request looks like from the client and server perspectives.

---

## Lab 1: Establish a Baseline

### Objective

Confirm that the application is running and establish a known-good request.

### Task

1. Start the Flask application.
2. Open:

```text
http://127.0.0.1:5000
```

3. Click:

```text
GET /health
```

4. Observe the result in the browser.
5. Observe the new entries in the Flask terminal.

### Record

```text
Request method:

Request path:

Response status:

Response body:

New server log entries:
```

### Questions

1. What evidence confirms that the application is running?
2. Did the browser receive an HTTP response?
3. What does the status code communicate?
4. What information does the response body provide?
5. Why is a known-good baseline useful before troubleshooting?

### Your conclusion

```text
What happened:


Evidence:


What this confirms:

```

---

## Lab 2: Inspect a Request in DevTools

### Objective

Use Chrome DevTools to separate the request from the response.

### Task

1. Open the Network tab.
2. Click:

```text
GET /health
```

3. Select the `/health` request.
4. Inspect the **General** section.

### Record: General

```text
Request URL:

Request method:

Status code:

Remote address:
```

### Task: Request headers

Find and record:

```text
Host:

User-Agent:

Accept:

Connection:
```

### Task: Response headers

Find and record:

```text
Content-Type:

Content-Length:

X-Request-ID:
```

### Task: Response body

Open the Response tab and record:

```text
Response body:
```

### Questions

1. Which information belongs to the request?
2. Which information belongs to the response?
3. Which header identifies the destination host?
4. Which header identifies the client software?
5. Did the GET request contain a request body?
6. What format was returned in the response body?
7. Which header could help you locate this request in server logs?

### Your conclusion

```text
The client sent:


The server returned:


The most useful tracing evidence was:

```

---

## Lab 3: Correlate a Request with Server Logs

### Objective

Use `X-Request-ID` to connect one client request to its server-side logs.

### Task

1. Click:

```text
GET /health
```

2. Open the request in DevTools.
3. Copy the response header:

```http
X-Request-ID
```

4. Search the Flask terminal for the same value.
5. Locate the request-started and request-finished entries.

### Record

```text
Request ID:

Request method from the log:

Request path from the log:

Response status from the log:

Request-started entry:

Request-finished entry:
```

### Questions

1. Where did you first find the request ID?
2. Where did the same value appear in the server logs?
3. Did the request and response use the same ID?
4. What client information appeared in the request log?
5. How would a request ID help investigate a customer report?
6. What information would you include in an engineering escalation?

### Draw the trace

```text
Client
  |
  v




  |
  v
Client
```

Add the request, application, logs, response, and request ID to the diagram.

### Your conclusion

```text
I correlated the client request with the server logs by:


The evidence that both records represent the same request is:

```

---

## Lab 4: Compare GET and POST

### Objective

Compare a request that retrieves data with one that submits data.

### Task 1: Inspect GET

1. Click:

```text
GET /health
```

2. Inspect the request in DevTools.

### Record

```text
Method:

Path:

Content-Type request header, if present:

Request body:

Response status:
```

### Task 2: Inspect POST

1. Click:

```text
Session Login
```

2. Select `/session/login` in DevTools.
3. Inspect the Headers and Payload tabs.

### Record

```text
Method:

Path:

Content-Type:

Request body:

Response status:

Response body:
```

### Compare

| Question              | `/health` | `/session/login` |
| --------------------- | --------- | ---------------- |
| HTTP method           |           |                  |
| Purpose               |           |                  |
| Request body present? |           |                  |
| Request content type  |           |                  |
| Creates login state?  |           |                  |
| Response status       |           |                  |

### Questions

1. Which request retrieved information?
2. Which request submitted information?
3. Where did DevTools display the POST body?
4. Why was `Content-Type` important for the POST request?
5. Does every POST request create a resource?
6. Does every GET request return JSON?

### Reproduce the request

Right-click `/session/login`:

```text
Copy
→ Copy as cURL
```

Paste the command into a text editor and identify:

```text
URL:

Method:

Headers:

Request body:

Cookies, if present:
```

### Your conclusion

```text
The main difference I observed between GET and POST was:


The browser represented the POST body as:

```

---

## Lab 5: Trace Session Authentication

### Objective

Observe how a session cookie is created, stored, and sent with a later request.

### Task 1: Log in

1. Open DevTools.
2. Click:

```text
Session Login
```

3. Select `/session/login`.
4. Inspect the request payload.
5. Inspect the response headers.

### Record

```text
Request method:

Request body:

Response status:

Set-Cookie header:

Request ID:
```

### Task 2: Inspect stored cookies

Open:

```text
DevTools
→ Application
→ Storage
→ Cookies
→ http://127.0.0.1:5000
```

### Record

```text
Cookie name:

Domain:

Path:

HttpOnly:

Secure:

SameSite:

Expiration:
```

Not every attribute may be present.

### Task 3: Access the session profile

1. Click:

```text
Session Profile
```

2. Select `/session/profile`.
3. Inspect the request headers.
4. Find the matching Flask log using the request ID.

### Record

```text
Cookie request header:

Response status:

Response body:

Request ID:

Matching server log:
```

### Questions

1. Which response instructed the browser to store the cookie?
2. Which request sent the cookie back?
3. Did the browser send the cookie automatically?
4. Was the username and password sent again to access the profile?
5. Which cookie attributes affect when JavaScript or the browser can use it?
6. How did the server identify the logged-in session?

### Draw the lifecycle

```text
POST /session/login
        |
        v




        |
        v
GET /session/profile
```

### Your conclusion

```text
The session was created when:


The browser proved it stored the session by:


The server recognized the later request because:

```

---

## Lab 6: Trace JWT Authentication

### Objective

Observe how a JWT is returned and explicitly added to a protected request.

### Task 1: Request a token

1. Click:

```text
JWT Login
```

2. Inspect `/jwt/login`.
3. Open the Response tab.

### Record

```text
Request method:

Request body:

Response status:

Token returned:

Request ID:
```

Do not commit real tokens to Git.

### Task 2: Access the JWT profile

1. Click:

```text
JWT Profile
```

2. Inspect `/jwt/profile`.
3. Find:

```http
Authorization: Bearer <token>
```

### Record

```text
Authorization header:

Response status:

Response body:

Request ID:

Matching server log:
```

### Questions

1. Where did the JWT first appear?
2. Which header carried it in the protected request?
3. Did the browser attach it automatically as a cookie?
4. Which part of the frontend added the Authorization header?
5. What is the difference between possessing a token and proving that the token is valid?
6. What information should never be included in a JWT payload?

### Compare authentication methods

| Question                               | Session cookie | JWT |
| -------------------------------------- | -------------- | --- |
| Returned by the server?                |                |     |
| Stored by the browser automatically?   |                |     |
| Sent automatically?                    |                |     |
| Sent in which header?                  |                |     |
| Requires client-side code in this lab? |                |     |
| Can expire?                            |                |     |

### Your conclusion

```text
Session authentication relied on:


JWT authentication relied on:


The most important difference I observed was:

```

---

## Lab 7: Inspect JWT Claims

### Objective

Inspect the structure and claims of a JWT without treating the decoded payload as proof that the token is valid.

### Task

1. Generate a token using **JWT Login**.
2. Copy the token.
3. Confirm that it has three dot-separated sections:

```text
header.payload.signature
```

4. Decode it locally:

```python
import jwt

token = "paste-token-here"

decoded = jwt.decode(
    token,
    options={"verify_signature": False}
)

print(decoded)
```

### Record

```text
Header:

Payload:

Signature present?

sub:

role:

iat:

exp:
```

### Questions

1. Which claim identifies the subject?
2. Which claim contains the role?
3. Which claim records when the token was issued?
4. Which claim controls expiration?
5. Is the payload encrypted?
6. Can a decoded token be trusted without signature verification?
7. What would happen if someone changed the role in the payload?
8. Why should the server restrict the accepted signing algorithm?

### Your conclusion

```text
Decoding a JWT reveals:


Decoding alone does not prove:


The signature is important because:

```

---

## Lab 8: Reproduce Requests with curl

### Objective

Send and inspect requests without relying on the browser interface.

### Task 1: Send a health request

Run:

```bash
curl -v http://127.0.0.1:5000/health
```

In verbose output:

```text
> represents request data
< represents response data
```

### Record

```text
Request method:

Request path:

Host header:

User-Agent:

Accept header:

Response status:

Content-Type:

X-Request-ID:

Response body:
```

### Questions

1. Which lines represent the outgoing request?
2. Which lines represent the incoming response?
3. What User-Agent did curl send?
4. How did this request differ from the browser request?
5. Did both clients reach the same endpoint?

---

### Task 2: Supply a request ID

Run:

```bash
curl -v \
  -H "X-Request-ID: request-lab-001" \
  http://127.0.0.1:5000/health
```

### Record

```text
Request ID sent:

Request ID returned:

Matching server log:
```

### Questions

1. Did the application preserve the supplied request ID?
2. Where did it appear?
3. Why should multiple services preserve the same tracing identifier?
4. What problem occurs if each service creates an unrelated ID?

---

### Task 3: Reproduce a session

Log in and save the cookie:

```bash
curl -v \
  -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"username":"getty","password":"cloud"}' \
  http://127.0.0.1:5000/session/login
```

Inspect the cookie file:

```bash
cat cookies.txt
```

Send the stored cookie:

```bash
curl -v \
  -b cookies.txt \
  http://127.0.0.1:5000/session/profile
```

### Record

```text
Login response status:

Cookie saved:

Profile request Cookie header:

Profile response status:

Request ID:
```

### Questions

1. What did `-c cookies.txt` do?
2. What did `-b cookies.txt` do?
3. How did curl reproduce the browser's cookie lifecycle?
4. Did curl automatically manage the cookie without those options?

---

### Task 4: Reproduce a JWT request

Request a token:

```bash
curl -s \
  -H "Content-Type: application/json" \
  -d '{"username":"getty","password":"cloud"}' \
  http://127.0.0.1:5000/jwt/login
```

Copy the returned token and run:

```bash
curl -v \
  -H "Authorization: Bearer PASTE_TOKEN_HERE" \
  http://127.0.0.1:5000/jwt/profile
```

### Record

```text
Authorization header:

Response status:

Response body:

Request ID:
```

### Questions

1. Did curl send the token automatically?
2. Which option added the Authorization header?
3. How does this compare with sending a cookie file?
4. Which approach gave you more direct control over the request?

### Your conclusion

```text
curl is useful for troubleshooting because:


Compared with the browser, curl allows me to:

```

---

## Lab 9: Investigate Latency

### Objective

Determine where time is spent during a slow request.

### Task 1: Inspect browser timing

Open:

```text
http://127.0.0.1:5000/slow
```

In DevTools:

```text
Network
→ /slow
→ Timing
```

### Record

```text
Total duration:

Connection time:

Waiting for server response:

Content download time:

Response status:

Response size:

Request ID:
```

### Task 2: Measure with curl

Run:

```bash
curl -s \
  -o /dev/null \
  -w "status=%{http_code}\nnamelookup=%{time_namelookup}s\nconnect=%{time_connect}s\nstarttransfer=%{time_starttransfer}s\ntotal=%{time_total}s\n" \
  http://127.0.0.1:5000/slow
```

### Record

```text
DNS lookup time:

Connection time:

Time to first byte:

Total time:

HTTP status:
```

### Questions

1. Which timing value accounted for most of the delay?
2. Was the delay primarily DNS, connection establishment, server waiting, or download time?
3. Was the response body large?
4. Did the server logs show when processing started and finished?
5. What additional evidence would you collect in a production system?
6. Which metrics would help distinguish application latency from dependency latency?

### Your conclusion

```text
The delay most likely occurred during:


Evidence:


The next production investigation would be:

```

---

## Lab 10: Trace an Application Error

### Objective

Correlate an HTTP `500` response with the server-side exception that produced it.

### Task

1. Click:

```text
Trigger 500
```

or run:

```bash
curl -v http://127.0.0.1:5000/error
```

2. Inspect the request and response.
3. Copy `X-Request-ID`.
4. Search the Flask terminal for the same ID.
5. Locate the related exception or stack trace.

### Record

```text
Request method:

Request path:

Response status:

Response body:

Request ID:

Matching request log:

Relevant exception:
```

### Questions

1. Did the client establish a connection?
2. Did the client receive an HTTP response?
3. Did the request reach the application?
4. What evidence connects the response to the exception?
5. Which layer produced the failure?
6. What evidence would you include when escalating the issue?
7. What information should be removed before sharing logs externally?

### Write an escalation note

```text
Timestamp:

Environment:

Endpoint:

HTTP method:

Status code:

Request ID:

Expected behavior:

Actual behavior:

Reproduction steps:

Relevant error:

Failure layer:

Suggested next step:
```

### Your conclusion

```text
The request reached:


The failure occurred:


The strongest evidence was:

```

---

## Optional Lab: Compare Browser Storage

### Objective

Compare cookies, local storage, session storage, and temporary JavaScript memory.

### Task

Open:

```text
DevTools
→ Application
```

Inspect:

```text
Cookies
Local Storage
Session Storage
```

In the Console, run:

```javascript
localStorage.setItem("theme", "dark");
localStorage.getItem("theme");
```

Refresh the page and inspect the value again.

You may also test:

```javascript
sessionStorage.setItem("lab", "request-tracing");
sessionStorage.getItem("lab");
```

### Compare

| Storage             | Survives refresh? | Shared across tabs? | Sent automatically to server? | Typical use |
| ------------------- | ----------------- | ------------------- | ----------------------------- | ----------- |
| Cookie              |                   |                     |                               |             |
| Local Storage       |                   |                     |                               |             |
| Session Storage     |                   |                     |                               |             |
| JavaScript variable |                   |                     |                               |             |

### Questions

1. Which storage mechanisms survived a refresh?
2. Which values appeared in HTTP request headers?
3. Which values required JavaScript to read or send?
4. What are the security tradeoffs of storing authentication tokens in browser storage?

---

## Lab 11: Inspect HTTPS and TLS

### Objective

Compare HTTP with HTTPS and inspect certificate validation.

### Task 1: Enable local HTTPS

Stop the application and configure Flask to run with:

```python
app.run(
    host="127.0.0.1",
    port=5443,
    debug=True,
    ssl_context="adhoc"
)
```

Install the required package if needed:

```bash
python -m pip install cryptography
```

Restart the application:

```bash
python app.py
```

Open:

```text
https://127.0.0.1:5443
```

### Record

```text
Did the browser show a warning?

Warning message:

Certificate trusted?

Connection encrypted?

Hostname used:
```

### Questions

1. Why can a connection be encrypted while the certificate remains untrusted?
2. What does the certificate warning communicate?
3. Is bypassing the warning a suitable production fix?
4. What must a browser validate before trusting a certificate?

---

### Task 2: Inspect with OpenSSL

Run:

```bash
openssl s_client \
  -connect 127.0.0.1:5443 \
  -servername localhost
```

### Record

```text
TLS version:

Cipher:

Certificate subject:

Certificate issuer:

Validity dates:

Verification result:
```

### Questions

1. Did the TCP connection succeed?
2. Did the server present a certificate?
3. Was a TLS protocol and cipher negotiated?
4. Did trust validation succeed?
5. Does the certificate identity match the hostname used?

---

### Task 3: Compare curl behavior

Run:

```bash
curl -v https://127.0.0.1:5443/health
```

Then, for this local exercise only:

```bash
curl -vk https://127.0.0.1:5443/health
```

### Record

```text
Result without -k:

Result with -k:

Certificate error:

HTTP status after bypass:
```

### Questions

1. At what stage did the first request fail?
2. Did it fail before or after receiving an HTTP response?
3. What did `-k` change?
4. What did `-k` not fix?
5. Why is `-k` unsafe as a production solution?

---

### Task 4: Compare HTTP and HTTPS

HTTP:

```bash
curl -v http://127.0.0.1:5000/health
```

HTTPS:

```bash
curl -vk https://127.0.0.1:5443/health
```

### Compare

| Observation           | HTTP | HTTPS |
| --------------------- | ---- | ----- |
| TCP connection        |      |       |
| TLS handshake         |      |       |
| Certificate presented |      |       |
| HTTP method           |      |       |
| HTTP headers          |      |       |
| Response status       |      |       |
| Encrypted in transit  |      |       |

### Your conclusion

```text
HTTPS adds:


HTTPS does not replace:


Certificate validation is important because:

```

---

# Phase 2: Inject and Diagnose Failures

Complete these challenges after finishing the guided labs.

For each challenge:

1. Reproduce the behavior.
2. Inspect the request.
3. Inspect the response or client error.
4. Check the application logs.
5. Identify the deepest layer reached.
6. Identify the failure layer.
7. Support the conclusion with evidence.
8. Recommend the next step.

Do not use the expected outcome as your diagnosis.

Observe the evidence yourself.

---

## Failure Challenge 1: Wrong Password

### Task

Send a session-login request with:

```json
{
  "username": "getty",
  "password": "wrong"
}
```

You may use the browser, copied curl command, or your own curl request.

### Investigate

```text
Did the connection succeed?

Did the request reach the application?

Which route handled the request?

Was a response returned?

What status was returned?

Was a session cookie created?

What appeared in the logs?
```

### Your diagnosis

```text
Failure layer:

Evidence:

Likely cause:

Next step:
```

---

## Failure Challenge 2: Missing Session Cookie

### Task

1. Log in successfully.
2. Confirm that the session profile works.
3. Delete the session cookie.
4. Request:

```text
/session/profile
```

### Investigate

```text
Was a Cookie header sent?

Did the request reach the application?

What status was returned?

What did the response body say?

What did the server log?
```

### Your diagnosis

```text
Failure layer:

Evidence:

Likely cause:

Next step:
```

---

## Failure Challenge 3: Invalid JWT

### Task

Send:

```http
Authorization: Bearer broken-token
```

to:

```text
/jwt/profile
```

Example:

```bash
curl -v \
  -H "Authorization: Bearer broken-token" \
  http://127.0.0.1:5000/jwt/profile
```

### Investigate

```text
Was the Authorization header present?

Did the protected route receive the request?

What status was returned?

What did the response body say?

What appeared in the logs?
```

### Your diagnosis

```text
Failure layer:

Evidence:

Likely cause:

Next step:
```

---

## Failure Challenge 4: Expired JWT

### Task

1. Generate a valid JWT.
2. Record its `exp` claim.
3. Wait until the token expires.
4. Send the token to:

```text
/jwt/profile
```

### Investigate

```text
Was the token structurally present?

Was the signature necessarily invalid?

Which claim affected the result?

What status was returned?

How did the response differ from a malformed token?
```

### Your diagnosis

```text
Failure layer:

Evidence:

Likely cause:

Next step:
```

---

## Failure Challenge 5: Nonexistent Route

### Task

Request:

```text
/not-a-real-route
```

Example:

```bash
curl -v http://127.0.0.1:5000/not-a-real-route
```

### Investigate

```text
Did the connection succeed?

Did the server return an HTTP response?

What status was returned?

Did an application exception occur?

Was a request ID returned?
```

### Your diagnosis

```text
Failure layer:

Evidence:

Likely cause:

Next step:
```

---

## Failure Challenge 6: Server Unavailable

### Task

1. Stop the Flask application.
2. Refresh the browser or run:

```bash
curl -v http://127.0.0.1:5000/health
```

### Investigate

```text
Did DNS resolution occur?

Was a TCP connection established?

Was an HTTP request processed?

Was an HTTP status code returned?

Did the Flask logs receive a request?
```

### Your diagnosis

```text
Failure layer:

Evidence:

Likely cause:

Next step:
```

---

## Failure Challenge 7: Wrong Port

### Task

Keep the application running on its normal port and request a different port:

```bash
curl -v http://127.0.0.1:5999/health
```

### Investigate

```text
How does this compare with the stopped-server challenge?

Was an HTTP status returned?

What does the client error indicate?

What network command could confirm whether a process is listening?
```

### Your diagnosis

```text
Failure layer:

Evidence:

Likely cause:

Next step:
```

---

## Failure Challenge 8: Malformed JSON

### Task

Send invalid JSON to the session-login endpoint.

Example:

```bash
curl -v \
  -H "Content-Type: application/json" \
  -d '{"username":"getty","password":}' \
  http://127.0.0.1:5000/session/login
```

### Investigate

```text
Did the request reach the server?

Was Content-Type present?

Could the body be parsed?

Which status was returned?

Did authentication logic run?

What appeared in the logs?
```

### Your diagnosis

```text
Failure layer:

Evidence:

Likely cause:

Next step:
```

---

## Failure Challenge 9: Missing Content-Type

### Task

Send valid JSON without declaring the content type:

```bash
curl -v \
  -d '{"username":"getty","password":"cloud"}' \
  http://127.0.0.1:5000/session/login
```

### Investigate

```text
Which Content-Type did curl use?

How did the application interpret the body?

How did the response differ from a valid login?

Was the problem transport, HTTP formatting, or authentication?
```

### Your diagnosis

```text
Failure layer:

Evidence:

Likely cause:

Next step:
```

---

## Failure Challenge 10: Slow Request

### Task

Request:

```text
/slow
```

Treat the delay as a customer-reported performance issue.

### Investigate

```text
Was the request successful?

Which timing phase was longest?

Did the server return an error?

Was the response body large?

What additional data would be needed to identify the slow function or dependency?
```

### Your diagnosis

```text
Failure layer:

Evidence:

Likely cause:

Next step:
```

---

## Failure Challenge 11: Application Exception

### Task

Request:

```text
/error
```

### Investigate

```text
Did the connection succeed?

Did the application receive the request?

What status was returned?

Which request ID connected the response to the logs?

What exception appeared?

What information belongs in an escalation?
```

### Your diagnosis

```text
Failure layer:

Evidence:

Likely cause:

Next step:
```

---

## Failure Challenge 12: Untrusted Certificate

### Task

Enable local HTTPS and run:

```bash
curl -v https://127.0.0.1:5443/health
```

Do not use `-k` during the first attempt.

### Investigate

```text
Was a TCP connection established?

Did the TLS handshake begin?

Was a certificate presented?

Did certificate validation succeed?

Was an HTTP response returned?

What certificate property caused the failure?
```

### Your diagnosis

```text
Failure layer:

Evidence:

Likely cause:

Next step:
```

---

# Failure Comparison

Complete this table after all failure challenges.

| Scenario              | Deepest successful layer | Failure layer | Client evidence | Server evidence | Next tool |
| --------------------- | ------------------------ | ------------- | --------------- | --------------- | --------- |
| Wrong password        |                          |               |                 |                 |           |
| Missing cookie        |                          |               |                 |                 |           |
| Invalid JWT           |                          |               |                 |                 |           |
| Expired JWT           |                          |               |                 |                 |           |
| Wrong route           |                          |               |                 |                 |           |
| Server unavailable    |                          |               |                 |                 |           |
| Wrong port            |                          |               |                 |                 |           |
| Malformed JSON        |                          |               |                 |                 |           |
| Missing Content-Type  |                          |               |                 |                 |           |
| Slow request          |                          |               |                 |                 |           |
| Application exception |                          |               |                 |                 |           |
| Untrusted certificate |                          |               |                 |                 |           |

---
