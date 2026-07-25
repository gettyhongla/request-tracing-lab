# Failure 11: Application Exception

## Scenario

Call an endpoint that intentionally raises an application error.

## Trigger

```bash
curl -i \
  -H "X-Request-ID: failure-11-application-exception" \
  http://127.0.0.1:5000/error
```

## Record

```text
Request method:
Request path:
Response status:
Response body:
X-Request-ID:
Matching server log:
Exception evidence:
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
A 500 means the request reached the application and the application failed while handling it.
```
