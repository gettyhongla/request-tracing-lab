# 07: Migrations And Rollbacks

Goal:

```text
Plan database schema changes safely for production.
```

Evidence Tasks:

* Explain backward-compatible migrations.
* Separate schema deploy from application deploy.
* Identify destructive migration risks.
* Define rollback and roll-forward options.
* Decide what should block a migration.

Questions:

```text
Can old code and new code both work with the schema?
Does the migration lock a large table?
Can the migration be rolled back?
Was it tested on production-like data size?
What backup or restore point exists before the change?
```

Completion standard:

```text
You can explain a safe migration plan and what evidence proves it is safe to run.
```
