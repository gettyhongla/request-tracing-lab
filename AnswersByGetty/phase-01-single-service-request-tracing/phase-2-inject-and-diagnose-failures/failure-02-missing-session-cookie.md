# Failure 02: Missing Session Cookie

## Scenario

Call `GET /session/profile` without first creating a valid session cookie.

## Trigger

```bash
curl -i \
  -H "X-Request-ID: failure-02-missing-session-cookie" \
  http://127.0.0.1:5000/session/profile
```

## Record

```text
Request method:
Request path:
Cookie header present?
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
A missing session cookie means the client did not present session state. Prove that by checking the request Cookie header, not just the response body.
```
