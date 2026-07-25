# Failure 04: Expired JWT

## Scenario

Call `GET /jwt/profile` with a token that is structurally valid but expired.

## Trigger

```bash
curl -i \
  -H "Authorization: Bearer <expired-token>" \
  -H "X-Request-ID: failure-04-expired-jwt" \
  http://127.0.0.1:5000/jwt/profile
```

## Record

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

## Conclusion

```text
What failed:
Failed layer:
Evidence:
What this rules out:
What I would tell engineering:
```

## Key Takeaway

```text
An expired JWT can prove the client had a token but the application rejected it because its validity window had passed.
```
