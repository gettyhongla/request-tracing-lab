# Failure 05: Nonexistent Route

## Scenario

Call a route that the Flask application does not define.

## Trigger

```bash
curl -i \
  -H "X-Request-ID: failure-05-nonexistent-route" \
  http://127.0.0.1:5000/not-a-real-route
```

## Record

```text
Request method:
Request path:
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
A 404 proves the server was reachable but the requested route did not exist.
```
