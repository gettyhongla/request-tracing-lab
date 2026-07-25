# 03: Database Data Model

Goal:

```text
Decide what data belongs in PostgreSQL and how the app should query it.
```

Evidence Tasks:

* Move from hard-coded users to database-backed users.
* Define tables for users, profiles, and operational events.
* Identify primary keys, foreign keys, and unique constraints.
* Decide which fields should never be logged.
* Explain what data is authoritative.

Questions:

```text
What is the source of truth?
What data must be durable?
What data is safe to cache?
What constraints protect data correctness?
What query supports the login or profile request?
```

Completion standard:

```text
You can explain the schema, the request path that uses it, and the evidence proving the row exists.
```
