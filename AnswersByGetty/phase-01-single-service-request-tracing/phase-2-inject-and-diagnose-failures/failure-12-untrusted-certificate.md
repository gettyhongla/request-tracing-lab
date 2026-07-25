# Failure 12: Untrusted Certificate

## Scenario

Call the HTTPS version of the app with a certificate the client does not trust.

## Trigger

```bash
curl -v \
  -H "X-Request-ID: failure-12-untrusted-certificate" \
  https://127.0.0.1:5443/health
```

## Record

```text
Request method:
Request path:
TLS error:
Response status:
X-Request-ID:
Matching server log:
Certificate evidence:
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
TLS trust failures can happen before HTTP reaches the app. Separate certificate negotiation from application behavior.
```
