# Lab 05: Support Ticket Data Model

Build a small support-ticket application on top of the Phase 2 request path.

The goal is to understand how users, authentication, tickets, messages, authorization, indexes, and database evidence fit together in PostgreSQL.

```text
Browser or curl -> NGINX -> Flask -> PostgreSQL
```

Redis may support cache/session behavior, but tickets belong in PostgreSQL because they are durable business records.

## Build

1. Draw the data relationships.
2. Read `migrations/001_support_tickets.sql`.
3. Apply the migration to the local PostgreSQL database.
4. Register a user.
5. Log in with a Flask session.
6. Create a ticket.
7. Add a ticket reply.
8. Create or log in as admin user `getty`.
9. View all tickets as admin.
10. Add an internal note as admin.

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

## What To Learn

**Users:** who can log in and what role they have.

**Tickets:** durable support records created by customers.

**Messages:** visible conversation history for a ticket.

**Internal notes:** admin-only messages hidden from regular users.

**Events:** audit records that connect database changes to a request ID.

**Indexes:** query helpers for common lookups, such as one customer's tickets or admin triage by status and priority.

## Prove

Capture:

```text
Schema applied:
User registered:
Session login:
Ticket created:
Ticket listed by owner:
Ticket blocked from another user:
Admin can list all tickets:
Internal note hidden from customer:
SQL query proves records exist:
Request ID appears in logs and ticket_events:
```

## Break

Stop PostgreSQL or use a bad `DATABASE_URL`.

Answer:

```text
What did the user see?
What did Flask log?
Did NGINX cause the failure?
What proves PostgreSQL was the failed dependency?
Was any partial ticket data saved?
```

## Done When

You can explain:

```text
Which table owns each kind of data.
Which foreign keys describe ownership and relationships.
Why customers can only see their own tickets.
Why admins can see all tickets and internal notes.
Why ticket records belong in PostgreSQL instead of Redis.
Which SQL query proves the ticket exists.
Which logs prove the request path.
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
Interview explanation:
Retained takeaway:
```
