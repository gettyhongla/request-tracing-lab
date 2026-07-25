# Failure 06: Server Unavailable

## Scenario

Call the application while the Flask server is not running.

## Trigger

```bash
curl -i \
  -H "X-Request-ID: failure-06-server-unavailable" \
  http://127.0.0.1:5000/health
```

## Record

```text
Request method:
Request path:
Response or curl error:
X-Request-ID:
Matching server log:
Was Flask running?
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
If Flask is unavailable, there may be no application log for the request. Absence of server evidence can itself be evidence.
```
