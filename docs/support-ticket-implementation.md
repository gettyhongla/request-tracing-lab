# Support Ticket Implementation Guide

This guide supports Phase 2 Lab 05.

## Files Changed

```text
app.py
requirements.txt
migrations/001_support_tickets.sql
phases/phase-02-building-a-production-service/labs/05-support-ticket-data-model.md
tests/test_support_tickets.py
```

## Initialize The Database

Apply the migration:

```bash
psql request_tracing_lab -f migrations/001_support_tickets.sql
```

Inspect the schema:

```bash
psql request_tracing_lab
\dt
\d users
\d tickets
\d ticket_messages
\d ticket_events
```

## Run The Application

Start dependencies:

```bash
brew services start postgresql@18
brew services start redis
brew services start nginx
```

Start Flask:

```bash
venv/bin/python app.py
```

## Sample Curl Commands

Register a customer:

```bash
curl -i -c /tmp/rtl-customer.cookie \
  -H 'Content-Type: application/json' \
  -d '{"username":"alice","email":"alice@example.com","password":"cloudpass"}' \
  http://127.0.0.1:8080/api/auth/register
```

Create a ticket:

```bash
curl -i -b /tmp/rtl-customer.cookie \
  -H 'Content-Type: application/json' \
  -d '{"title":"Cannot trace request","description":"I need help reading request logs.","category":"technical_question","priority":"medium"}' \
  http://127.0.0.1:8080/api/tickets
```

List your tickets:

```bash
curl -i -b /tmp/rtl-customer.cookie \
  http://127.0.0.1:8080/api/tickets
```

Register admin `getty`:

```bash
curl -i -c /tmp/rtl-admin.cookie \
  -H 'Content-Type: application/json' \
  -d '{"username":"getty","email":"getty@example.com","password":"cloudpass"}' \
  http://127.0.0.1:8080/api/auth/register
```

Admin list all tickets:

```bash
curl -i -b /tmp/rtl-admin.cookie \
  http://127.0.0.1:8080/api/admin/tickets
```

Admin add internal note:

```bash
curl -i -b /tmp/rtl-admin.cookie \
  -H 'Content-Type: application/json' \
  -d '{"body":"Internal note: customer included enough request evidence."}' \
  http://127.0.0.1:8080/api/admin/tickets/1/internal-notes
```

## Expected Responses

Successful registration returns `201`.

Successful login returns `200`.

Successful ticket creation returns `201`.

Unauthorized customer access returns `403`.

Duplicate account registration returns `409`.

Database unavailable returns `503`.

## Inspect PostgreSQL Records

```sql
SELECT id, username, role, created_at FROM users ORDER BY id;
SELECT id, ticket_number, created_by, status, priority FROM tickets ORDER BY id;
SELECT id, ticket_id, author_id, message_type FROM ticket_messages ORDER BY id;
SELECT id, ticket_id, action, request_id FROM ticket_events ORDER BY id;
```

## Reset Local Test Data

This deletes support-ticket lab data while keeping the schema.

```sql
TRUNCATE ticket_events, ticket_messages, tickets, users
RESTART IDENTITY CASCADE;
```

## Break The Database Dependency

Stop PostgreSQL:

```bash
brew services stop postgresql@18
```

Send a ticket request through NGINX. The expected response is `503 database unavailable`.

Restart PostgreSQL:

```bash
brew services start postgresql@18
```
