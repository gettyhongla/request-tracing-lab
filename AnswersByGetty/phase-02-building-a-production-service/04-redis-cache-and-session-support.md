# Lab 04: Redis Cache And Session Support

## Build

The goal of this lab is to add Redis as temporary support state.

```text
Browser or curl -> NGINX -> Flask -> Redis cache
                              |
                              -> PostgreSQL on cache miss
```

For this lab, I chose one Redis responsibility:

```text
Cache the GET /notes response.
```

PostgreSQL remains the durable source of truth. Redis stores a temporary copy of the latest notes response so repeated reads can be served faster.

## What Redis Is

Redis is an in-memory key/value store. It is commonly used for fast temporary data such as cache entries, sessions, counters, locks, and queue-related state.

For this lab, Redis is a cache. It is not the system of record. If Redis loses the cached value, Flask can still read from PostgreSQL and rebuild the cache.

## Redis Core vs Redis Stack Modules

For Lab 04, you only need Redis core:

```text
SET
GET
EXPIRE
TTL
DEL
```

Redis Stack modules are optional extensions for specialized features such as search, JSON documents, bloom filters, and time-series data. They are not needed for this cache lab.

## Commands I Ran

Start and verify Redis:

```bash
brew search redis
brew install redis
brew services start redis
brew services list
redis-cli ping
```

Connection evidence:

```text
PONG
```

Manual Redis basics:

```redis
SET lab:test "hello redis"
GET lab:test
TTL lab:test
EXPIRE lab:test 30
TTL lab:test
DEL lab:test
GET lab:test
```

Evidence:

```text
SET lab:test "hello redis" -> OK
GET lab:test -> "hello redis"
TTL lab:test -> -1
EXPIRE lab:test 30 -> 1
TTL lab:test -> 30
DEL lab:test -> 1
GET lab:test -> nil
```

`TTL -1` means the key exists but has no expiration. After `EXPIRE`, Redis shows a countdown. `nil` means the key no longer exists.

## Runtime Configuration

Flask connects to Redis through runtime configuration:

```text
REDIS_URL=redis://127.0.0.1:6379/0
NOTES_CACHE_KEY=notes:latest
NOTES_CACHE_TTL_SECONDS=30
```

Local Redis runs on `127.0.0.1:6379`. In AWS, the same idea would point to an ElastiCache endpoint. In containers later, it may point to a service name such as `redis:6379`.

## Cache Behavior

The `GET /notes` path now works like this:

```text
1. Check Redis for notes:latest.
2. If the key exists, return cache: hit.
3. If the key is missing, read PostgreSQL, store the result in Redis, return cache: miss.
4. If Redis is unavailable, read PostgreSQL anyway, return cache: unavailable.
```

The `POST /notes` path writes to PostgreSQL and deletes `notes:latest` from Redis so the next read refreshes the cache.

## Prove

**Clear the cache:**

```bash
redis-cli DEL notes:latest
```

**Cache miss:**

```bash
curl -i http://127.0.0.1:8080/notes
```

Expected evidence:

```text
HTTP/1.1 200 OK
"cache": "miss"
```

Flask log evidence:

```text
cache_miss request_id=<id> key=notes:latest
database_read request_id=<id> table=request_notes rows=3
cache_store request_id=<id> key=notes:latest ttl_seconds=30 rows=3
```

**Cache hit:**

```bash
curl -i http://127.0.0.1:8080/notes
```

Expected evidence:

```text
HTTP/1.1 200 OK
"cache": "hit"
```

Flask log evidence:

```text
cache_hit request_id=<id> key=notes:latest rows=3
```

**TTL evidence:**

```bash
redis-cli TTL notes:latest
```

Observed evidence:

```text
18
```

This proves Redis stored the cached notes with an expiration.

## Break

I tested Redis-unavailable behavior by pointing Flask at the wrong Redis port:

```bash
REDIS_URL=redis://127.0.0.1:6390/0
```

Observed result:

```text
status 200
cache unavailable
rows 3
```

Flask log evidence:

```text
cache_error request_id=<id> key=notes:latest
redis.exceptions.ConnectionError: Error 61 connecting to 127.0.0.1:6390. Connection refused.
database_read request_id=<id> table=request_notes rows=3
request_finished request_id=<id> status=200
```

## Failure Conclusion

**What did the user see?** The user still received `200 OK` with notes.

**Did the app fail closed, fail open, or fall back?** The app fell back to PostgreSQL.

**Did PostgreSQL still work?** Yes. PostgreSQL returned the notes when Redis was unavailable.

**What proved Redis was the failed dependency?** Flask logged a Redis connection error to `127.0.0.1:6390`.

**What was the impact?** Redis failure disabled cache behavior, but it did not block the whole request.

## Cache vs Queue

This lab uses Redis as cache, not as a queue.

```text
Cache: helps a synchronous request read faster.
Queue: stores work for a worker to process later.
Worker: runs outside the request/response path.
```

Async does not automatically mean real-time. Async means work can happen after the user request returns. Real-time means users receive live or near-live updates.

## Cloud Connection

**AWS:** Redis maps to Amazon ElastiCache for Redis or Valkey. PostgreSQL maps to Amazon RDS PostgreSQL.

**Cloudflare:** Cloudflare can cache at the edge, terminate TLS, and proxy traffic before it reaches the app. Redis is different because it is an application-side cache that Flask controls directly.

## Key Takeaways

**Redis is fast temporary state:** It is useful for cache/session behavior, but it is not the durable source of truth.

**PostgreSQL remains source of truth:** SQL still proves what data actually exists.

**Cache miss reads PostgreSQL:** Redis being empty should not break the request.

**Cache hit reads Redis:** Repeated reads can avoid hitting PostgreSQL for a short time.

**Redis failure should degrade gracefully:** For this endpoint, Redis unavailable means slower reads, not a failed user request.

**Cache/session Redis belongs in Phase 2:** Queue/worker Redis belongs later when the architecture adds asynchronous processing.
