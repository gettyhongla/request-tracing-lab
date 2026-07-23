# Lab 6: Trace JWT Authentication

## Task 1: Request a Token

```text
Request method:
POST

Response status:
200 OK

Request ID:
f6d175c8-e795-451a-86e9-4b1c353320dc
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

## Task 2: Access the JWT Profile

Authorization header:

```http
Authorization: Bearer <redacted-jwt>
```

```text
Response status:
200 OK

Request ID:
f64d214f-d50e-4d56-9b40-772fd980368f
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

Matching server log:

```text
2026-07-23 11:32:37,887 INFO request_started request_id=f64d214f-d50e-4d56-9b40-772fd980368f method=GET path=/jwt/profile remote_ip=127.0.0.1 user_agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
2026-07-23 11:32:37,888 INFO request_finished request_id=f64d214f-d50e-4d56-9b40-772fd980368f status=200
2026-07-23 11:32:37,888 INFO 127.0.0.1 - - [23/Jul/2026 11:32:37] "GET /jwt/profile HTTP/1.1" 200 -
```

## Questions

1. Where did the JWT first appear?

The JWT first appeared in the response body from `POST /jwt/login`.

2. Which header carried it in the protected request?

```http
Authorization: Bearer <redacted-jwt>
```

3. Did the browser attach it automatically as a cookie?

No. The browser automatically sends cookies, but it does not automatically send JWTs. In this lab, JavaScript manually adds the JWT to the `Authorization` header.

4. Which part of the frontend added the Authorization header?

The `viewJwtProfile()` JavaScript function added the `Authorization` header.

In this app, the Flask home route returns a page with JavaScript button handlers. When the `JWT Profile` button is clicked, the browser runs `viewJwtProfile()`, which sends `GET /jwt/profile` and adds the token as `Authorization: Bearer <redacted-jwt>`.

```js
headers: {
  "Authorization": `Bearer ${jwtToken}`
}
```

5. What is the difference between possessing a token and proving that the token is valid?
Possessing a token means the client has a token string. Proving it is valid means the server verifies the token's signature, expiration, algorithm, and claims.

6. What information should never be included in a JWT payload?
Passwords, private keys, API keys, secrets, sensitive personal data, or anything you would not want exposed. JWT payloads are encoded, not encrypted.

## Compare Authentication Methods

| Question                               | Session cookie      | JWT                                  |
| -------------------------------------- | ------------------- | ------------------------------------ |
| Returned by the server?                | Yes                 | Yes                                  |
| Stored by the browser automatically?   | Yes                 | No, not in this lab                  |
| Sent automatically?                    | Yes                 | No                                   |
| Sent in which header?                  | `Cookie`            | `Authorization`                      |
| Requires client-side code in this lab? | No                  | Yes                                  |
| Can expire?                            | Yes                 | Yes                                  |

## Conclusion

```text
Session authentication relied on: A session cookie that the browser stored and automatically sent back to the server.

JWT authentication relied on: A bearer token returned by `/jwt/login` and explicitly added to the `Authorization` header for `/jwt/profile`.

The most important difference I observed was: Cookies are handled automatically by the browser, while the JWT had to be manually added by frontend JavaScript.
```

## Key Takeaways

```text
JWT: JSON Web Token.
Cookie auth: Browser automatically sends the Cookie header.
JWT auth: Application code explicitly sends the Authorization header.
X-Request-ID: Traces the request, but does not authenticate anyone.
```
A JWT has three dot-separated parts:  ```text header.payload.signature ```
