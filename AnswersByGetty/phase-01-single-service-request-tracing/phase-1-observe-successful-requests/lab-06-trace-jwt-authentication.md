# Trace Report: Lab 06 - Trace JWT Authentication

## Purpose

Trace successful JWT authentication from token issuance through a protected profile request.

This trace shows where the JWT first appears, how the client sends it back, and how JWT authentication differs from session-cookie authentication.

## Token Request

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

## Protected Request

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

## Trace Summary

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

## Compare Authentication Methods

| Question | Session cookie | JWT |
| --- | --- | --- |
| Returned by the server? | Yes | Yes |
| Stored by the browser automatically? | Yes | No, not in this lab |
| Sent automatically? | Yes | No |
| Sent in which header? | `Cookie` | `Authorization` |
| Requires client-side code in this lab? | No | Yes |
| Can expire? | Yes | Yes |

## What This Confirms

Session authentication relied on a session cookie that the browser stored and automatically sent back to the server.

JWT authentication relied on a bearer token returned by `/jwt/login` and explicitly added to the `Authorization` header for `/jwt/profile`.

Possessing a token means the client has a token string. Proving it is valid means the server verifies the token's signature, expiration, algorithm, and claims.

Passwords, private keys, API keys, secrets, sensitive personal data, or anything that should not be exposed must not be included in a JWT payload. JWT payloads are encoded, not encrypted.

## Retained Takeaway

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
