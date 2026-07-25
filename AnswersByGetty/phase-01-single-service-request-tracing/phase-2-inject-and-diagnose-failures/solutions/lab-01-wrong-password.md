# Lab 01 Solution: Wrong Password

## Scenario

Invalid credentials were submitted to the session login endpoint. The goal was to determine whether the failure was caused by authentication logic, routing, connectivity, or application availability.

## Request

```text
Request method:
POST

Request path:
/session/login

Request body:
{"username":"getty","password":"wrong"}

X-Request-ID:
failure-01-wrong-password
```

## Response

```text
Response status:
401 Unauthorized

Response body:
The application returned an invalid-credentials response.
```

## Server Evidence

```text
2026-07-25 09:49:39,254 INFO request_started request_id=af67e94a-2283-48d5-b6cd-faaf01d3127f method=GET path=/ remote_ip=127.0.0.1 user_agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
2026-07-25 09:49:39,255 INFO request_finished request_id=af67e94a-2283-48d5-b6cd-faaf01d3127f status=200
2026-07-25 09:49:39,255 INFO 127.0.0.1 - - [25/Jul/2026 09:49:39] "GET / HTTP/1.1" 200 -

2026-07-25 09:49:56,487 INFO request_started request_id=failure-01-wrong-password method=POST path=/session/login remote_ip=127.0.0.1 user_agent=curl/8.7.1
2026-07-25 09:49:56,487 INFO request_finished request_id=failure-01-wrong-password status=401
2026-07-25 09:49:56,487 INFO 127.0.0.1 - - [25/Jul/2026 09:49:56] "POST /session/login HTTP/1.1" 401 -
```

## Evidence-Based Conclusion

```text
What failed:
The submitted password was invalid.

Failed layer:
Application authentication logic.

Evidence:
The request reached Flask at POST /session/login.
The request carried X-Request-ID failure-01-wrong-password.
The server logged request_started and request_finished for the same request ID.
The application returned 401, which is a controlled authentication rejection.

What this rules out:
This rules out a client-to-server connectivity problem, wrong port, missing route, and general application outage.
The successful GET / request shows the app was reachable before the login attempt.
The POST /session/login log shows Flask received and handled the failed login request.

Engineering note:
This is an authentication failure, not an infrastructure or availability failure. The request reached the application successfully, and Flask rejected the invalid password with a 401 response.
```

## Key Takeaway

```text
Authentication failure is not the same as application outage. The request reached Flask, the route executed, and the application intentionally rejected the invalid credentials.
```
