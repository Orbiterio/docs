-- Warm Intro proposed schema. Documentation artifact only; not an applied migration.
-- Generate actual goose migration filenames with make migration after schema review.
-- UUIDv7 values are generated in Go. Status vocabularies are validated by services.
CREATE SCHEMA warm_intros;

-- One durable record per attempted introduction, retained after completion, decline, expiry, cancellation, or archival. A deliberate restart creates a new ID linked to its predecessor.
CREATE TABLE warm_intros.introductions (
    id                                 uuid PRIMARY KEY,
    owner_user_id                      uuid NOT NULL REFERENCES users.users(id) ON DELETE RESTRICT,
    organization_id                    uuid REFERENCES organizations.organizations(id) ON DELETE RESTRICT,
    source_batch_id                    uuid REFERENCES suggestions.suggestion_batch(id) ON DELETE SET NULL,
    source_suggestion_id               uuid REFERENCES suggestions.suggestion(id) ON DELETE SET NULL,
    source_action_ref                  text NOT NULL,
    source_key                         text NOT NULL,
    source_snapshot                    jsonb NOT NULL,
    previous_introduction_id           uuid REFERENCES warm_intros.introductions(id) ON DELETE RESTRICT,
    state                              text NOT NULL,
    revision                           bigint NOT NULL DEFAULT 1,
    current_context_version_id         uuid,
    launch_context_version_id          uuid,
    current_stage                      text NOT NULL,
    stream_seq                         bigint NOT NULL DEFAULT 0,
    created_at                         timestamptz NOT NULL DEFAULT now(),
    updated_at                         timestamptz NOT NULL DEFAULT now(),
    started_at                         timestamptz,
    closed_at                          timestamptz,
    archived_at                        timestamptz,
    active_source_key                  text,
    UNIQUE (id, owner_user_id)
);
CREATE INDEX introductions_owner_history_idx ON warm_intros.introductions(owner_user_id, created_at DESC, id DESC);
CREATE INDEX introductions_owner_state_idx ON warm_intros.introductions(owner_user_id, state, created_at DESC, id DESC);
CREATE UNIQUE INDEX introductions_active_source_uq ON warm_intros.introductions(owner_user_id, active_source_key) WHERE active_source_key IS NOT NULL;

-- Two stable identities per introduction. Live links can disappear without losing the historical identity. The email/name/role actually approved for sending belongs in the context snapshot.
CREATE TABLE warm_intros.participants (
    id                                 uuid PRIMARY KEY,
    introduction_id                    uuid NOT NULL REFERENCES warm_intros.introductions(id) ON DELETE RESTRICT,
    contact_id                         uuid REFERENCES persons.contacts(id) ON DELETE SET NULL,
    person_id                          uuid REFERENCES persons.persons(id) ON DELETE SET NULL,
    original_person_id                 uuid NOT NULL,
    source_role                        text NOT NULL,
    identity_snapshot                  jsonb NOT NULL,
    created_at                         timestamptz NOT NULL DEFAULT now(),
    UNIQUE (introduction_id, id),
    UNIQUE (introduction_id, original_person_id),
    UNIQUE (introduction_id, source_role)
);

-- Append-only WHY, sender intent, profile, address, and order history. Every message review, consent, and send can resolve the exact context used at that point.
CREATE TABLE warm_intros.context_versions (
    id                                 uuid PRIMARY KEY,
    introduction_id                    uuid NOT NULL REFERENCES warm_intros.introductions(id) ON DELETE RESTRICT,
    version                            bigint NOT NULL,
    source_why_text                    text,
    why_connect                        text,
    sender_intent                      text,
    why_status                         text NOT NULL,
    why_provenance                     jsonb NOT NULL,
    private_context                    jsonb NOT NULL DEFAULT '{}'::jsonb,
    recipient_safe_facts               jsonb NOT NULL,
    public_why                         text,
    sender_snapshot                    jsonb NOT NULL,
    participant_snapshots              jsonb NOT NULL,
    first_participant_id               uuid NOT NULL,
    second_participant_id              uuid NOT NULL,
    recommended_first_participant_id   uuid,
    relationship_evidence              jsonb NOT NULL DEFAULT '{}'::jsonb,
    change_reason                      text NOT NULL,
    created_by_user_id                 uuid REFERENCES users.users(id) ON DELETE SET NULL,
    created_at                         timestamptz NOT NULL DEFAULT now(),
    UNIQUE (introduction_id, id),
    UNIQUE (introduction_id, version),
    FOREIGN KEY (introduction_id, first_participant_id) REFERENCES warm_intros.participants(introduction_id, id) ON DELETE RESTRICT,
    FOREIGN KEY (introduction_id, second_participant_id) REFERENCES warm_intros.participants(introduction_id, id) ON DELETE RESTRICT,
    FOREIGN KEY (introduction_id, recommended_first_participant_id) REFERENCES warm_intros.participants(introduction_id, id) ON DELETE RESTRICT
);

-- Stable logical message slots: two requests and one final introduction. Neutral closure slots are created only when applicable. Reordering never changes a request’s participant.
CREATE TABLE warm_intros.messages (
    id                                 uuid PRIMARY KEY,
    introduction_id                    uuid NOT NULL REFERENCES warm_intros.introductions(id) ON DELETE RESTRICT,
    kind                               text NOT NULL,
    participant_id                     uuid,
    current_version_id                 uuid,
    approved_version_id                uuid,
    active_generation_run_id           uuid,
    generation_status                  text NOT NULL,
    created_at                         timestamptz NOT NULL DEFAULT now(),
    updated_at                         timestamptz NOT NULL DEFAULT now(),
    UNIQUE (introduction_id, id),
    UNIQUE NULLS NOT DISTINCT (introduction_id, kind, participant_id),
    FOREIGN KEY (introduction_id, participant_id) REFERENCES warm_intros.participants(introduction_id, id) ON DELETE RESTRICT
);

-- Append-only saved draft and sent-message content. Each completed AI result or debounced human save produces a new version; keep all server-accepted versions, not every keystroke.
CREATE TABLE warm_intros.message_versions (
    id                                 uuid PRIMARY KEY,
    introduction_id                    uuid NOT NULL REFERENCES warm_intros.introductions(id) ON DELETE RESTRICT,
    message_id                         uuid NOT NULL,
    version                            bigint NOT NULL,
    context_version_id                 uuid NOT NULL,
    subject                            text NOT NULL,
    body                               text NOT NULL,
    content_sha256                     bytea NOT NULL,
    author_type                        text NOT NULL,
    author_user_id                     uuid REFERENCES users.users(id) ON DELETE SET NULL,
    generation_run_id                  uuid,
    supersedes_version_id              uuid REFERENCES warm_intros.message_versions(id) ON DELETE RESTRICT,
    created_at                         timestamptz NOT NULL DEFAULT now(),
    UNIQUE (introduction_id, id),
    UNIQUE (message_id, id),
    UNIQUE (message_id, version),
    FOREIGN KEY (introduction_id, message_id) REFERENCES warm_intros.messages(introduction_id, id) ON DELETE RESTRICT,
    FOREIGN KEY (introduction_id, context_version_id) REFERENCES warm_intros.context_versions(introduction_id, id) ON DELETE RESTRICT
);

-- Append-only sender approval receipts. A review is current only when its message version and approval dependency hash match the current draft. Invalidation does not delete prior reviews.
CREATE TABLE warm_intros.reviews (
    id                                 uuid PRIMARY KEY,
    introduction_id                    uuid NOT NULL REFERENCES warm_intros.introductions(id) ON DELETE RESTRICT,
    message_id                         uuid NOT NULL,
    message_version_id                 uuid NOT NULL,
    context_version_id                 uuid NOT NULL,
    approval_scope_sha256              bytea NOT NULL,
    reviewed_by_user_id                uuid NOT NULL REFERENCES users.users(id) ON DELETE RESTRICT,
    reviewed_at                        timestamptz NOT NULL DEFAULT now(),
    UNIQUE (message_id, message_version_id, context_version_id),
    FOREIGN KEY (introduction_id, message_id) REFERENCES warm_intros.messages(introduction_id, id) ON DELETE RESTRICT,
    FOREIGN KEY (message_id, message_version_id) REFERENCES warm_intros.message_versions(message_id, id) ON DELETE RESTRICT,
    FOREIGN KEY (introduction_id, context_version_id) REFERENCES warm_intros.context_versions(introduction_id, id) ON DELETE RESTRICT
);

-- Recipient-specific capability tied to one frozen invitation. Create the second invitation only after the first acceptance applies. No account is needed to resolve it.
CREATE TABLE warm_intros.invitations (
    id                                 uuid PRIMARY KEY,
    introduction_id                    uuid NOT NULL REFERENCES warm_intros.introductions(id) ON DELETE RESTRICT,
    participant_id                     uuid NOT NULL,
    context_version_id                 uuid NOT NULL,
    message_id                         uuid NOT NULL,
    token_hash                         bytea NOT NULL UNIQUE,
    token_version                      integer NOT NULL DEFAULT 1,
    state                              text NOT NULL,
    first_send_attempt_at              timestamptz,
    expires_at                         timestamptz,
    revoked_at                         timestamptz,
    created_at                         timestamptz NOT NULL DEFAULT now(),
    UNIQUE (introduction_id, id),
    UNIQUE (introduction_id, participant_id),
    FOREIGN KEY (introduction_id, participant_id) REFERENCES warm_intros.participants(introduction_id, id) ON DELETE RESTRICT,
    FOREIGN KEY (introduction_id, context_version_id) REFERENCES warm_intros.context_versions(introduction_id, id) ON DELETE RESTRICT,
    FOREIGN KEY (introduction_id, message_id) REFERENCES warm_intros.messages(introduction_id, id) ON DELETE RESTRICT
);
CREATE INDEX invitations_expiry_idx ON warm_intros.invitations(expires_at, id) WHERE state IN ('queued', 'active');

-- One immutable accept/decline per invitation. This records what was actually approved, independent of later mail outcomes.
CREATE TABLE warm_intros.consent_decisions (
    id                                 uuid PRIMARY KEY,
    introduction_id                    uuid NOT NULL REFERENCES warm_intros.introductions(id) ON DELETE RESTRICT,
    invitation_id                      uuid NOT NULL UNIQUE,
    decision                           text NOT NULL,
    context_version_id                 uuid NOT NULL,
    consent_copy_version               text NOT NULL,
    consent_copy_snapshot              text NOT NULL,
    request_id                         text NOT NULL,
    decided_at                         timestamptz NOT NULL DEFAULT now(),
    applied_at                         timestamptz,
    UNIQUE (introduction_id, id),
    FOREIGN KEY (introduction_id, invitation_id) REFERENCES warm_intros.invitations(introduction_id, id) ON DELETE RESTRICT,
    FOREIGN KEY (introduction_id, context_version_id) REFERENCES warm_intros.context_versions(introduction_id, id) ON DELETE RESTRICT
);

-- Optional decline notes, private to the sender. Append revisions separately from immutable consent and from generic activity summaries.
CREATE TABLE warm_intros.decision_notes (
    id                                 uuid PRIMARY KEY,
    introduction_id                    uuid NOT NULL REFERENCES warm_intros.introductions(id) ON DELETE RESTRICT,
    decision_id                        uuid NOT NULL,
    revision                           bigint NOT NULL,
    note                               text NOT NULL,
    created_at                         timestamptz NOT NULL DEFAULT now(),
    UNIQUE (decision_id, revision),
    FOREIGN KEY (introduction_id, decision_id) REFERENCES warm_intros.consent_decisions(introduction_id, id) ON DELETE RESTRICT
);

-- Durable generation queue and provenance for each of the three parallel LLM calls. A retry/fallback has a new run ID; retain failed and superseded runs.
CREATE TABLE warm_intros.generation_runs (
    id                                 uuid PRIMARY KEY,
    introduction_id                    uuid NOT NULL REFERENCES warm_intros.introductions(id) ON DELETE RESTRICT,
    message_id                         uuid NOT NULL,
    context_version_id                 uuid NOT NULL,
    base_message_version_id            uuid,
    parent_run_id                      uuid REFERENCES warm_intros.generation_runs(id) ON DELETE RESTRICT,
    status                             text NOT NULL,
    model_id                           text NOT NULL,
    provider_generation_id             text,
    prompt_name                        text NOT NULL,
    prompt_version                     text NOT NULL,
    prompt_sha256                      bytea NOT NULL,
    input_snapshot                     jsonb NOT NULL,
    input_sha256                       bytea NOT NULL,
    settings                           jsonb NOT NULL,
    partial_subject                    text NOT NULL DEFAULT '',
    partial_body                       text NOT NULL DEFAULT '',
    usage                              jsonb NOT NULL DEFAULT '{}'::jsonb,
    finish_reason                      text,
    error_code                         text,
    lease_until                        timestamptz,
    next_attempt_at                    timestamptz NOT NULL DEFAULT now(),
    started_at                         timestamptz,
    completed_at                       timestamptz,
    created_at                         timestamptz NOT NULL DEFAULT now(),
    UNIQUE (introduction_id, id),
    UNIQUE (message_id, id),
    FOREIGN KEY (introduction_id, message_id) REFERENCES warm_intros.messages(introduction_id, id) ON DELETE RESTRICT,
    FOREIGN KEY (introduction_id, context_version_id) REFERENCES warm_intros.context_versions(introduction_id, id) ON DELETE RESTRICT
);
CREATE INDEX generation_runs_due_idx ON warm_intros.generation_runs(next_attempt_at, id) WHERE status = 'queued';

-- Replayable SSE transport. Short-lived chunks can be compacted after completion because final versions and run provenance remain; history is not dependent on chunks.
CREATE TABLE warm_intros.stream_events (
    introduction_id                    uuid NOT NULL REFERENCES warm_intros.introductions(id) ON DELETE RESTRICT,
    seq                                bigint NOT NULL,
    run_id                             uuid,
    message_id                         uuid,
    kind                               text NOT NULL,
    payload                            jsonb NOT NULL,
    created_at                         timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (introduction_id, seq),
    FOREIGN KEY (introduction_id, run_id) REFERENCES warm_intros.generation_runs(introduction_id, id) ON DELETE RESTRICT,
    FOREIGN KEY (introduction_id, message_id) REFERENCES warm_intros.messages(introduction_id, id) ON DELETE RESTRICT
);

-- Durable outbox and one logical message send. The approved text, envelope, rendered HTML/text, and provider result remain inspectable even when retries occur.
CREATE TABLE warm_intros.mail_deliveries (
    id                                 uuid PRIMARY KEY,
    introduction_id                    uuid NOT NULL REFERENCES warm_intros.introductions(id) ON DELETE RESTRICT,
    message_id                         uuid NOT NULL,
    message_version_id                 uuid NOT NULL,
    context_version_id                 uuid NOT NULL,
    invitation_id                      uuid,
    logical_key                        text NOT NULL UNIQUE,
    state                              text NOT NULL,
    template_name                      text NOT NULL,
    template_version                   text NOT NULL,
    rendered_snapshot                  jsonb NOT NULL,
    payload_ciphertext                 bytea,
    encryption_key_version             text,
    payload_sha256                     bytea,
    provider_email_id                  text UNIQUE,
    provider_accepted_at               timestamptz,
    delivery_facts                     jsonb NOT NULL DEFAULT '{}'::jsonb,
    attempt_count                      integer NOT NULL DEFAULT 0,
    lease_until                        timestamptz,
    lease_token                        uuid,
    next_attempt_at                    timestamptz NOT NULL DEFAULT now(),
    first_attempt_at                   timestamptz,
    last_error_code                    text,
    created_at                         timestamptz NOT NULL DEFAULT now(),
    updated_at                         timestamptz NOT NULL DEFAULT now(),
    UNIQUE (introduction_id, id),
    FOREIGN KEY (introduction_id, message_id) REFERENCES warm_intros.messages(introduction_id, id) ON DELETE RESTRICT,
    FOREIGN KEY (message_id, message_version_id) REFERENCES warm_intros.message_versions(message_id, id) ON DELETE RESTRICT,
    FOREIGN KEY (introduction_id, context_version_id) REFERENCES warm_intros.context_versions(introduction_id, id) ON DELETE RESTRICT,
    FOREIGN KEY (introduction_id, invitation_id) REFERENCES warm_intros.invitations(introduction_id, id) ON DELETE RESTRICT
);
CREATE INDEX mail_deliveries_due_idx ON warm_intros.mail_deliveries(next_attempt_at, id) WHERE state IN ('queued', 'retryable_failed');

-- Append-only record of every actual Resend API attempt. Attempts are not new logical emails.
CREATE TABLE warm_intros.delivery_attempts (
    id                                 uuid PRIMARY KEY,
    delivery_id                        uuid NOT NULL REFERENCES warm_intros.mail_deliveries(id) ON DELETE RESTRICT,
    attempt_number                     integer NOT NULL,
    lease_token                        uuid NOT NULL,
    request_sha256                     bytea NOT NULL,
    started_at                         timestamptz NOT NULL DEFAULT now(),
    finished_at                        timestamptz,
    outcome                            text NOT NULL,
    http_status                        integer,
    provider_email_id                  text,
    error_code                         text,
    retry_after_seconds                integer,
    UNIQUE (delivery_id, attempt_number)
);

-- Permanent introduction timeline, separate from short-lived streaming chunks. Append in the same transaction as the state change.
CREATE TABLE warm_intros.events (
    id                                 uuid PRIMARY KEY,
    introduction_id                    uuid NOT NULL REFERENCES warm_intros.introductions(id) ON DELETE RESTRICT,
    event_type                         text NOT NULL,
    actor_type                         text NOT NULL,
    actor_user_id                      uuid REFERENCES users.users(id) ON DELETE SET NULL,
    participant_id                     uuid,
    message_id                         uuid,
    delivery_id                        uuid,
    context_version_id                 uuid,
    causation_id                       uuid,
    request_id                         text,
    metadata                           jsonb NOT NULL DEFAULT '{}'::jsonb,
    occurred_at                        timestamptz NOT NULL DEFAULT now(),
    FOREIGN KEY (introduction_id, participant_id) REFERENCES warm_intros.participants(introduction_id, id) ON DELETE RESTRICT,
    FOREIGN KEY (introduction_id, message_id) REFERENCES warm_intros.messages(introduction_id, id) ON DELETE RESTRICT,
    FOREIGN KEY (introduction_id, delivery_id) REFERENCES warm_intros.mail_deliveries(introduction_id, id) ON DELETE RESTRICT,
    FOREIGN KEY (introduction_id, context_version_id) REFERENCES warm_intros.context_versions(introduction_id, id) ON DELETE RESTRICT
);
CREATE INDEX events_intro_timeline_idx ON warm_intros.events(introduction_id, occurred_at, id);

-- Durable verified webhook inbox, including unmatched events arriving before the send receipt.
CREATE TABLE warm_intros.provider_events (
    id                                 uuid PRIMARY KEY,
    provider_event_id                  text NOT NULL UNIQUE,
    provider_email_id                  text NOT NULL,
    delivery_id                        uuid REFERENCES warm_intros.mail_deliveries(id) ON DELETE RESTRICT,
    event_type                         text NOT NULL,
    provider_occurred_at               timestamptz NOT NULL,
    received_at                        timestamptz NOT NULL DEFAULT now(),
    payload                            jsonb NOT NULL,
    status                             text NOT NULL,
    processed_at                       timestamptz,
    error_code                         text
);
CREATE INDEX provider_events_unmatched_idx ON warm_intros.provider_events(received_at, id) WHERE status IN ('pending', 'unmatched', 'failed');

-- Durable request idempotency for create, save, review, start, decisions, notes, archive and cancel. Store no bearer token in the scope.
CREATE TABLE warm_intros.mutation_receipts (
    id                                 uuid PRIMARY KEY,
    scope_type                         text NOT NULL,
    scope_id                           uuid NOT NULL,
    operation                          text NOT NULL,
    idempotency_key                    text NOT NULL,
    request_sha256                     bytea NOT NULL,
    introduction_id                    uuid REFERENCES warm_intros.introductions(id) ON DELETE RESTRICT,
    response_status                    integer NOT NULL,
    response_snapshot                  jsonb NOT NULL,
    created_at                         timestamptz NOT NULL DEFAULT now(),
    UNIQUE (scope_type, scope_id, operation, idempotency_key)
);

-- Deferred creation-order links; application inserts draft root before children.
ALTER TABLE warm_intros.introductions ADD FOREIGN KEY (id, current_context_version_id) REFERENCES warm_intros.context_versions(introduction_id, id) ON DELETE RESTRICT;
ALTER TABLE warm_intros.introductions ADD FOREIGN KEY (id, launch_context_version_id) REFERENCES warm_intros.context_versions(introduction_id, id) ON DELETE RESTRICT;
ALTER TABLE warm_intros.messages ADD FOREIGN KEY (id, current_version_id) REFERENCES warm_intros.message_versions(message_id, id) ON DELETE RESTRICT;
ALTER TABLE warm_intros.messages ADD FOREIGN KEY (id, approved_version_id) REFERENCES warm_intros.message_versions(message_id, id) ON DELETE RESTRICT;
ALTER TABLE warm_intros.messages ADD FOREIGN KEY (id, active_generation_run_id) REFERENCES warm_intros.generation_runs(message_id, id) ON DELETE RESTRICT;
ALTER TABLE warm_intros.message_versions ADD FOREIGN KEY (message_id, generation_run_id) REFERENCES warm_intros.generation_runs(message_id, id) ON DELETE RESTRICT;
ALTER TABLE warm_intros.generation_runs ADD FOREIGN KEY (message_id, base_message_version_id) REFERENCES warm_intros.message_versions(message_id, id) ON DELETE RESTRICT;
