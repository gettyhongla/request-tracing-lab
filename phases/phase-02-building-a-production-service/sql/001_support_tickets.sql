-- Phase 2 Lab 05: Support ticket data model
-- PostgreSQL owns support data because tickets, users, messages, and events
-- must survive application restarts. Redis is only temporary support state.

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT users_role_check CHECK (role IN ('customer', 'admin'))
);

COMMENT ON TABLE users IS 'Application users. Customers create tickets; admins support tickets.';
COMMENT ON COLUMN users.password_hash IS 'Secure password hash. Plaintext passwords are never stored.';

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower
    ON users (LOWER(username));
COMMENT ON INDEX idx_users_username_lower IS 'Prevents duplicate usernames with different casing and supports login lookup.';

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower
    ON users (LOWER(email));
COMMENT ON INDEX idx_users_email_lower IS 'Prevents duplicate email addresses with different casing.';

CREATE TABLE IF NOT EXISTS tickets (
    id BIGSERIAL PRIMARY KEY,
    ticket_number TEXT NOT NULL UNIQUE,
    created_by BIGINT NOT NULL REFERENCES users(id),
    assigned_to BIGINT REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    CONSTRAINT tickets_category_check CHECK (
        category IN (
            'bug',
            'technical_question',
            'feature_request',
            'project_feedback',
            'access_issue',
            'performance_issue'
        )
    ),
    CONSTRAINT tickets_priority_check CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT tickets_status_check CHECK (
        status IN ('open', 'in_progress', 'waiting_on_customer', 'resolved', 'closed')
    )
);

COMMENT ON TABLE tickets IS 'Support tickets. Each ticket belongs to the user in created_by.';
COMMENT ON COLUMN tickets.created_by IS 'Foreign key to users.id for the customer who opened the ticket.';
COMMENT ON COLUMN tickets.assigned_to IS 'Foreign key to users.id for the admin/support owner, when assigned.';

CREATE INDEX IF NOT EXISTS idx_tickets_created_by_created_at
    ON tickets (created_by, created_at DESC);
COMMENT ON INDEX idx_tickets_created_by_created_at IS 'Supports listing one customer''s tickets newest first.';

CREATE INDEX IF NOT EXISTS idx_tickets_status_priority
    ON tickets (status, priority);
COMMENT ON INDEX idx_tickets_status_priority IS 'Supports admin triage by status and priority.';

CREATE TABLE IF NOT EXISTS ticket_messages (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    author_id BIGINT NOT NULL REFERENCES users(id),
    body TEXT NOT NULL,
    message_type TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ticket_messages_type_check CHECK (
        message_type IN ('customer_reply', 'support_reply', 'internal_note', 'system_event')
    )
);

COMMENT ON TABLE ticket_messages IS 'Conversation history for a ticket, including customer replies, support replies, internal notes, and system events.';
COMMENT ON COLUMN ticket_messages.ticket_id IS 'Foreign key to tickets.id. This connects each message to one ticket.';
COMMENT ON COLUMN ticket_messages.author_id IS 'Foreign key to users.id. This connects each message to the user who wrote it.';

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id_created_at
    ON ticket_messages (ticket_id, created_at);
COMMENT ON INDEX idx_ticket_messages_ticket_id_created_at IS 'Supports loading a ticket''s message history in chronological order.';

CREATE TABLE IF NOT EXISTS ticket_events (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    actor_id BIGINT REFERENCES users(id),
    action TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    request_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ticket_events IS 'Audit trail for important ticket changes and request tracing.';
COMMENT ON COLUMN ticket_events.ticket_id IS 'Foreign key to tickets.id. This connects events to the changed ticket.';
COMMENT ON COLUMN ticket_events.actor_id IS 'Foreign key to users.id. This records which user caused the event.';
COMMENT ON COLUMN ticket_events.request_id IS 'Request ID from Flask/NGINX logs so database events can be correlated with one request.';

CREATE INDEX IF NOT EXISTS idx_ticket_events_ticket_id_created_at
    ON ticket_events (ticket_id, created_at DESC);
COMMENT ON INDEX idx_ticket_events_ticket_id_created_at IS 'Supports investigating one ticket''s recent changes.';
