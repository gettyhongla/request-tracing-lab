# Failure 03: Invalid JWT

## Scenario

Call `GET /jwt/profile` with a malformed or invalid bearer token.

## Trigger

```bash
curl -i \
  -H "Authorization: Bearer invalid.token.value" \
  -H "X-Request-ID: failure-03-invalid-jwt" \
  http://127.0.0.1:5000/jwt/profile
```

## Record

```text
Request method:
Request path:
Authorization header:
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
JWT failures require checking whether the token was missing, malformed, expired, or rejected by signature validation.
```
