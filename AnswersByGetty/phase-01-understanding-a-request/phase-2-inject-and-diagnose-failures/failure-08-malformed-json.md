# Failure 08: Malformed JSON

## Scenario

Send invalid JSON to a route that expects a JSON body.

## Trigger

```bash
curl -i \
  -H "Content-Type: application/json" \
  -H "X-Request-ID: failure-08-malformed-json" \
  -d '{"username":"getty","password":' \
  http://127.0.0.1:5000/session/login
```

## Record

```text
Request method:
Request path:
Content-Type:
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
Malformed request bodies can look like auth failures if the app silently fails to parse input. Check the request payload and parsing behavior before assuming credentials are wrong.
```
