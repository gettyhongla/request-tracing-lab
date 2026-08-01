# Lab 05: Support-Ticket Data Model

Build the data model behind the support-ticket application.

## Why This Lab Exists

The app is no longer just a request-tracing demo. It is becoming a public-facing support-ticket system where users can register, submit technical issues or project feedback, review ticket history, and receive support responses.

This lab teaches how one submitted support issue becomes related PostgreSQL records.

## Architecture Before

```text
Browser or curl -> NGINX -> Flask -> PostgreSQL
```

The app already has a simple request path and basic PostgreSQL persistence.

## Architecture After

```text
Browser or curl
  |
  v
NGINX
  |
  v
Flask support-ticket API
  |
  v
PostgreSQL
  |-- users
  |-- tickets
  |-- ticket_messages
  `-- ticket_events
```

Redis may support sessions, cache, or queue behavior later, but tickets belong in PostgreSQL because they are durable business records.

## Key Terms

| Term | Meaning In This Lab |
| --- | --- |
| Primary key | Unique ID for one row |
| Foreign key | Relationship from one table to another |
| Constraint | Database rule that prevents invalid data |
| Index | Data structure that helps common queries run faster |
| Ownership | Rule that decides which user is allowed to access a ticket |
| Audit event | Record of an important change and the request ID that caused it |

## Relationship Model

```text
users
  |-- tickets.created_by
  |-- tickets.assigned_to
  |-- ticket_messages.author_id
  `-- ticket_events.actor_id

tickets
  |-- ticket_messages.ticket_id
  `-- ticket_events.ticket_id
```

## Must Implement Or Inspect

1. Read [migrations/001_support_tickets.sql](../../../migrations/001_support_tickets.sql).
2. Apply the migration to the local PostgreSQL database.
3. Register a customer user.
4. Log in using a Flask session.
5. Create a support ticket.
6. Add a customer reply.
7. Register or log in as admin user `getty`.
8. View all tickets as admin.
9. Add an internal note as admin.
10. Confirm regular users cannot see internal notes.

## Healthy-Path Verification

Capture one successful ticket creation:

```text
Client request:
Client response:
Flask log:
PostgreSQL users row:
PostgreSQL tickets row:
PostgreSQL ticket_messages row:
PostgreSQL ticket_events row:
Request ID:
```

**Users:** who can log in and what role they have.

**Tickets:** durable support records created by customers.

**Messages:** visible conversation history for a ticket.

**Internal notes:** admin-only messages hidden from regular users.

**Events:** audit records that connect database changes to a request ID.

**Indexes:** query helpers for common lookups, such as one customer's tickets or admin triage by status and priority.

## Controlled Failures

Test at least two:

```text
Duplicate username:
Unauthenticated ticket creation:
Customer tries to view another customer's ticket:
Customer tries to use an admin endpoint:
PostgreSQL stopped or wrong DATABASE_URL:
```

## Evidence To Capture

```text
Schema:
Connection configuration:
Register request:
Login request:
Create ticket request:
Read ticket request:
Admin update request:
SQL evidence:
Application log:
Database failure symptom:
Authorization failure symptom:
Request ID in ticket_events:
Interview explanation:
Retained takeaway:
```

## Troubleshooting Questions

```text
Which table owns each kind of data?
Which foreign keys describe ownership and relationships?
Which constraint prevented bad data?
Which index supports listing one customer's tickets?
Why can customers only see their own tickets?
Why can admins see all tickets and internal notes?
Why do ticket records belong in PostgreSQL instead of Redis?
Which SQL query proves the ticket exists?
Which logs prove the request path?
```

## Interview Explanation

Use this shape:

```text
When a customer creates a ticket, Flask authenticates the user from the server-managed session, validates the request body, inserts the ticket into PostgreSQL, inserts the initial message, and records a ticket event with the request ID. PostgreSQL is the source of truth because tickets must survive app restarts and cache expiration. Redis can support temporary sessions, cache, or queues, but it should not be the durable store for customer support history.
```

## Completion Standard

```text
The learner can explain how one submitted support issue becomes related PostgreSQL records and why specific indexes and constraints exist.
```

## Retained Takeaway

```text
The database is not just storage. It enforces relationships, protects ownership rules with data structure, and gives evidence that the application actually saved the customer's support request.
```
