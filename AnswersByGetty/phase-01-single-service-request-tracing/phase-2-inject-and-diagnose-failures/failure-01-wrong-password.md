# Failure 01: Wrong Password

## Scenario

Submit invalid credentials to `POST /session/login` or `POST /jwt/login`.

## Trigger

```bash
curl -i \
  -H "Content-Type: application/json" \
  -H "X-Request-ID: failure-01-wrong-password" \
  -d '{"username":"getty","password":"wrong"}' \
  http://127.0.0.1:5000/session/login
```

## Record

```text
Request method:
Request path:
Request body:
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
Authentication failure is not the same as application outage. The request reached Flask and Flask intentionally rejected the credentials.
```
