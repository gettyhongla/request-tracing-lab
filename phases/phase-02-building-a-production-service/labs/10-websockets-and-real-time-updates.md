# Lab 10: WebSockets And Real-Time Updates

Let a customer viewing a ticket receive a support reply or status update without manually refreshing.

## Why This Lab Exists

Asynchronous work and real-time updates are related but not the same. A worker can process work in the background without showing live progress. A WebSocket keeps a connection open so the server can push updates to the client.

## Architecture Before

```text
Browser -> HTTP request -> Flask -> HTTP response
```

The browser asks for updates by refreshing or polling.

## Architecture After

```text
Browser
  |
  v
Persistent WebSocket connection
  |
  v
Flask real-time update path
  |
  v
Ticket room or channel
```

At larger scale, multiple Flask replicas need shared pub/sub so any replica can broadcast the update.

## Key Terms

| Term | Meaning |
| --- | --- |
| HTTP request/response | Client asks, server responds, connection can close |
| HTTP Upgrade | Switch from HTTP to WebSocket protocol |
| WebSocket | Persistent two-way connection |
| Server event | Update pushed from server to client |
| Disconnect | Client or server connection closes |
| Reconnect | Client opens a new connection after disconnect |
| Heartbeat/ping | Small signal proving connection is still alive |
| Room/channel | Group of clients authorized for the same ticket |
| Sticky session | Load balancer keeps a client on the same backend |
| Pub/sub | Shared message path across replicas |

## Must Implement Or Inspect

1. Choose one ticket update event: support reply or status change.
2. Sketch how the browser subscribes to one ticket.
3. Verify the user is authenticated.
4. Verify the user is authorized for that ticket.
5. Send one server event to the connected browser.
6. Test disconnect and reconnect behavior.
7. Document proxy timeout considerations.
8. Explain how multiple replicas would need shared pub/sub.

A minimal demonstration is enough. Do not build a complex chat system.

## Comparison

| Pattern | Best For | Tradeoff |
| --- | --- | --- |
| Polling | Simple periodic checks | Extra requests and delay |
| Server-sent events | One-way server updates | Less flexible than WebSockets |
| WebSockets | Interactive live updates | Persistent connections and scaling concerns |
| Webhooks | Server-to-server event delivery | Not for browser live UI updates |

## Healthy-Path Verification

Capture:

```text
Connection opened:
Authenticated user:
Authorized ticket:
Support reply or status update:
Browser receives update:
Server log:
Request ID or event ID:
```

## Controlled Failures

Test:

```text
Unauthenticated connection:
Unauthorized ticket room:
Client disconnect:
Server restart:
Proxy timeout:
Multiple clients viewing different tickets:
```

## Evidence To Capture

```text
Connection path:
Auth evidence:
Authorization evidence:
Update event:
Client received update:
Disconnect behavior:
Reconnect behavior:
Proxy timeout note:
Scaling note:
Interview explanation:
Retained takeaway:
```

## Troubleshooting Questions

```text
Is the user connected?
Is the user authorized for this ticket?
Did the server emit an update?
Did the proxy close the connection?
Would another app replica know about this update?
Should this feature use polling, SSE, or WebSockets?
```

## Interview Explanation

```text
WebSockets keep a connection open so the server can push ticket updates to the browser. They are different from webhooks, which are server-to-server callbacks. WebSockets need authentication, authorization, reconnect handling, proxy timeouts, and a shared pub/sub design when the app scales beyond one replica.
```

## Completion Standard

```text
The learner can explain request/response HTTP versus persistent WebSocket connections and why real-time updates require different operational evidence.
```

## Retained Takeaway

```text
Real-time means live client updates. It adds connection state, authorization boundaries, and scaling concerns that normal HTTP requests do not have.
```
