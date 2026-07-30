# Failure 10: Slow Request

## Scenario

Call an endpoint that intentionally responds slowly.

## Trigger

```bash
curl -i \
  -H "X-Request-ID: failure-10-slow-request" \
  http://127.0.0.1:5000/slow
```

## Record

```text
Request method:
Request path:
Client duration:
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
Latency is not always failure. A slow successful response still needs timing evidence so the time spent can be located.
```
