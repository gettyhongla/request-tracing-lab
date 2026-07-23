# Lab 5: Trace Session Authentication

## Task 1: Log In

```text
Request method: POST

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

Set-Cookie header:

```http
Set-Cookie: session=eyJ1c2VybmFtZSI6ImdldHR5In0.amIbDg.ytZI2Baqbr7AYn3Oj8bWtqqmiKQ; HttpOnly; Path=/
```

## Task 2: Inspect Stored Cookies

```text
Cookie name: session

Domain: 127.0.0.1

Path: /

HttpOnly: Checked

Secure: Blank

SameSite: Blank

Expiration: Session
```

## Task 3: Access the Session Profile

Cookie request header:

```http
Cookie: session=eyJ1c2VybmFtZSI6ImdldHR5In0...
```

```text
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

Matching server log:

```text
2026-07-23 10:46:45,355 INFO request_started request_id=210dae52-495f-495c-8eeb-1b8dbef54761 method=GET path=/session/profile remote_ip=127.0.0.1 user_agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
2026-07-23 10:46:45,355 INFO request_finished request_id=210dae52-495f-495c-8eeb-1b8dbef54761 status=200
2026-07-23 10:46:45,356 INFO 127.0.0.1 - - [23/Jul/2026 10:46:45] "GET /session/profile HTTP/1.1" 200 -
```

## Questions

1. Which response instructed the browser to store the cookie?

The `POST /session/login` response instructed the browser to store the cookie by returning a `Set-Cookie` response header.

2. Which request sent the cookie back?

The `GET /session/profile` request sent the cookie back in the `Cookie` request header.

3. Did the browser send the cookie automatically?

Yes. After the browser stored the session cookie, it automatically sent that cookie on later matching requests to `127.0.0.1:5000` based on domain/path rules.

4. Was the username and password sent again to access the profile?

No. The username and password were sent to `POST /session/login`. The later `GET /session/profile` request used the existing session cookie instead of sending the credentials again.

5. Which cookie attributes affect when JavaScript or the browser can use it?

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

6. How did the server identify the logged-in session?

The server identified the logged-in session using the `session` cookie.

## Draw the Lifecycle

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

## Conclusion

```text
The session was created when:
The browser sent POST /session/login with valid JSON credentials, and Flask returned a Set-Cookie response header.

The browser proved it stored the session by:
The session cookie appeared in DevTools under Application > Cookies, and the later /session/profile request included a Cookie request header.

The server recognized the later request because:
The browser automatically sent the session cookie with GET /session/profile, allowing Flask to identify the logged-in user without sending the username and password again.
```

## Key Takeaways

```text
Set-Cookie:
Response header from the server that tells the browser to store a cookie.
  *** compare session/login response header  to /session/profile response header, where & why is set-cookie missing?

Cookie:
Request header from the browser that sends a stored cookie back to the server.

X-Request-ID:
Tracing header used to connect a browser response with server logs.
```

A `request ID` traces one request. A `session cookie` proves the browser has login state.

`Set-Cookie` is a response header from the server:

```http
Set-Cookie: session=...; HttpOnly; Path=/
```

Meaning:

```text
Store this cookie and send it back on future matching requests.
```

## Fun Fact: Cookie vs Cache

```text
Cookie:
Small data stored by the browser and sent back to the server on matching requests.

Cache:
Saved response data the browser can reuse so it does not have to download the same resource again.
```

Cookies are mostly about state and identity. Cache is mostly about performance.
