# Microservice Reading Exercise

This is an architecture reading lab, not a feature build.

## Architecture

```text
Client
  -> NGINX
  -> API service
  -> internal profile/service boundary
  -> Redis
  -> PostgreSQL
```

## Questions To Work Through

```text
1. What is the healthy request path?
2. Which component owns each responsibility?
3. Which component initiates each connection?
4. What protocol is used at each boundary?
5. What would the client observe if NGINX failed?
6. What would the client observe if the API service failed?
7. What would the client observe if the internal service failed?
8. What would the client observe if Redis failed?
9. What evidence would exist at each layer?
10. Where should investigation begin?
11. What would prove the request reached the next service?
```

## Key Mental Model

```text
"The application is down" is too vague.
Name the failed boundary and prove it.
```

## Evidence Map

| Suspected Boundary | Evidence To Seek | Strong Conclusion |
| --- | --- | --- |
| Client -> NGINX | Client error and NGINX access log | Request did or did not reach the proxy |
| NGINX -> API | NGINX error log and API request log | Proxy could or could not reach upstream |
| API -> internal service | API log, internal service log, HTTP status | API reached or failed before internal service |
| Internal service -> Redis | Internal service log and Redis connectivity | Failure belongs to temporary-state dependency |
| API -> PostgreSQL | API DB error and SQL connectivity | Failure belongs to durable-data dependency |
