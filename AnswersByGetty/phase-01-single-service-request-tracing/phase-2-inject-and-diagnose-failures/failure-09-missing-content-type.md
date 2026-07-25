# Failure 09: Missing Content Type

## Scenario

Send a JSON body without declaring `Content-Type: application/json`.

## Trigger

```bash
curl -i \
  -H "X-Request-ID: failure-09-missing-content-type" \
  -d '{"username":"getty","password":"cloud"}' \
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
Content-Type tells the application how to parse the body. A valid-looking payload can still fail if the server does not treat it as JSON.
```
