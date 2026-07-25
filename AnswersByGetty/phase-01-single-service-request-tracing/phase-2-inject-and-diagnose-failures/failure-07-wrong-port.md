# Failure 07: Wrong Port

## Scenario

Call the right host but the wrong local port.

## Trigger

```bash
curl -i \
  -H "X-Request-ID: failure-07-wrong-port" \
  http://127.0.0.1:5999/health
```

## Record

```text
Request method:
Request path:
Port used:
Response or curl error:
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
A wrong port fails before the request reaches Flask, so the client error and missing app log are both important evidence.
```
