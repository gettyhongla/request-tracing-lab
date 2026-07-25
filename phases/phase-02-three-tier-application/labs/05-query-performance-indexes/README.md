# 05: Query Performance And Indexes

Goal:

```text
Diagnose slow database-backed requests with query evidence.
```

Evidence Tasks:

* Compare browser timing, NGINX upstream timing, Flask duration, and query timing.
* Identify the SQL query used by a route.
* Use `EXPLAIN` or `EXPLAIN ANALYZE` conceptually.
* Decide whether an index would help.
* Separate slow query from slow network or slow application code.

Questions:

```text
Which query was slow?
How many rows did it scan?
Was an index used?
Did latency come from waiting, planning, execution, or returning too much data?
What metric or log would reveal this faster next time?
```

Completion standard:

```text
You can explain why the query is slow and propose a fix supported by evidence.
```
