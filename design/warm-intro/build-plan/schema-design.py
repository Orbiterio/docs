from pathlib import Path
import json
root=Path(__file__).parent
T=[]
def table(name,purpose,fields,indexes=(),constraints=()):
    cols=[]
    for line in fields.strip().splitlines():
        n,typ,rule,meaning=line.split('|',3)
        cols.append({'name':n,'type':typ,'rule':rule,'meaning':meaning})
    T.append({'name':name,'purpose':purpose,'columns':cols,'indexes':list(indexes),'constraints':list(constraints)})
table('introductions','One durable record per attempted introduction, retained after completion, decline, expiry, cancellation, or archival. A deliberate restart creates a new ID linked to its predecessor.', '''
id|uuid|PRIMARY KEY|Application-issued UUIDv7.
owner_user_id|uuid|NOT NULL REFERENCES users.users(id) ON DELETE RESTRICT|Sender and history owner; never accepted from request body.
organization_id|uuid|REFERENCES organizations.organizations(id) ON DELETE RESTRICT|Source scope when applicable; not a grant of shared history access.
source_batch_id|uuid|REFERENCES suggestions.suggestion_batch(id) ON DELETE SET NULL|Live source link; snapshot survives source removal.
source_suggestion_id|uuid|REFERENCES suggestions.suggestion(id) ON DELETE SET NULL|Live source link; source tuple is checked by the source reader.
source_action_ref|text|NOT NULL|Original make_intro action reference.
source_key|text|NOT NULL|Immutable canonical batch/suggestion/action identity for duplicate-open handling.
source_snapshot|jsonb|NOT NULL|Original IDs, title, source metadata and raw WHY; immutable, owner-private.
previous_introduction_id|uuid|REFERENCES warm_intros.introductions(id) ON DELETE RESTRICT|Intentional new attempt after a prior closed sequence.
state|text|NOT NULL|Go-validated lifecycle vocabulary.
revision|bigint|NOT NULL DEFAULT 1|Optimistic concurrency counter for every owner-visible mutation.
current_context_version_id|uuid||Current owner-reviewed working context; composite FK added after context table exists.
launch_context_version_id|uuid||Frozen context at start, immutable afterward.
current_stage|text|NOT NULL|draft, first_request, second_request, final_introduction, or closed.
stream_seq|bigint|NOT NULL DEFAULT 0|Per-introduction durable SSE sequence allocated under this row lock.
created_at|timestamptz|NOT NULL DEFAULT now()|Creation time, including drafts that never launch.
updated_at|timestamptz|NOT NULL DEFAULT now()|Current activity time.
started_at|timestamptz||Explicit sender authorization time.
closed_at|timestamptz||Terminal workflow milestone; preserve historical events.
archived_at|timestamptz||Hide from default history, never delete correspondence.
active_source_key|text||Set to source_key while active, cleared at terminal closure; enables deliberate restarts.
''',indexes=["CREATE INDEX introductions_owner_history_idx ON warm_intros.introductions(owner_user_id, created_at DESC, id DESC)","CREATE INDEX introductions_owner_state_idx ON warm_intros.introductions(owner_user_id, state, created_at DESC, id DESC)","CREATE UNIQUE INDEX introductions_active_source_uq ON warm_intros.introductions(owner_user_id, active_source_key) WHERE active_source_key IS NOT NULL"],constraints=['UNIQUE (id, owner_user_id)'])
table('participants','Two stable identities per introduction. Live links can disappear without losing the historical identity. The email/name/role actually approved for sending belongs in the context snapshot.', '''
id|uuid|PRIMARY KEY|UUIDv7, stable across order changes.
introduction_id|uuid|NOT NULL REFERENCES warm_intros.introductions(id) ON DELETE RESTRICT|Owning introduction.
contact_id|uuid|REFERENCES persons.contacts(id) ON DELETE SET NULL|Live sender-owned contact; authorize at creation and launch.
person_id|uuid|REFERENCES persons.persons(id) ON DELETE SET NULL|Live master-person pointer.
original_person_id|uuid|NOT NULL|Immutable original identity even after merges/deletion.
source_role|text|NOT NULL|beneficiary or suggested; independent of selected send order.
identity_snapshot|jsonb|NOT NULL|Original full name and source identifiers; supports historical labels.
created_at|timestamptz|NOT NULL DEFAULT now()|Creation time.
''',constraints=['UNIQUE (introduction_id, id)','UNIQUE (introduction_id, original_person_id)','UNIQUE (introduction_id, source_role)'])
table('context_versions','Append-only WHY, sender intent, profile, address, and order history. Every message review, consent, and send can resolve the exact context used at that point.', '''
id|uuid|PRIMARY KEY|UUIDv7.
introduction_id|uuid|NOT NULL REFERENCES warm_intros.introductions(id) ON DELETE RESTRICT|Owning introduction.
version|bigint|NOT NULL|Monotonic context revision per introduction.
source_why_text|text||Original natural-language WHY, verbatim with paragraph breaks; never replace with a label/score.
why_connect|text||Working natural-language explanation of why the two people should connect.
sender_intent|text||Separate natural-language explanation of what the sender wants to accomplish; nullable if not supplied.
why_status|text|NOT NULL|present, partially_present, or not_provided; never fabricate missing rationale.
why_provenance|jsonb|NOT NULL|For each text: source type, source ID/version, authored_by and captured_at; retain original and edited provenance.
private_context|jsonb|NOT NULL DEFAULT '{}'::jsonb|Additional owner-private suggestion reasoning; never public DTO content.
recipient_safe_facts|jsonb|NOT NULL|Allowlisted facts usable in recipient copy; distinct from private context.
public_why|text||Sender-reviewed common explanation allowed in recipient-facing copy, when supplied; do not auto-publish private WHY.
sender_snapshot|jsonb|NOT NULL|Display name, verified reply address and signature policy at this version.
participant_snapshots|jsonb|NOT NULL|Exactly two keyed objects: participant ID, name, title/company, selected address/address source, safe profile and selected position.
first_participant_id|uuid|NOT NULL|First execution recipient for this version.
second_participant_id|uuid|NOT NULL|Second execution recipient for this version.
recommended_first_participant_id|uuid||Recommendation kept independently from selected order.
relationship_evidence|jsonb|NOT NULL DEFAULT '{}'::jsonb|Private comparable weight/evidence source and as-of time; no public exposure.
change_reason|text|NOT NULL|source_loaded, why_edited, address_changed, order_changed, profile_changed, or sender_changed.
created_by_user_id|uuid|REFERENCES users.users(id) ON DELETE SET NULL|Editor identity; nullable for system capture.
created_at|timestamptz|NOT NULL DEFAULT now()|Append time.
''',constraints=['UNIQUE (introduction_id, id)','UNIQUE (introduction_id, version)','FOREIGN KEY (introduction_id, first_participant_id) REFERENCES warm_intros.participants(introduction_id, id) ON DELETE RESTRICT','FOREIGN KEY (introduction_id, second_participant_id) REFERENCES warm_intros.participants(introduction_id, id) ON DELETE RESTRICT','FOREIGN KEY (introduction_id, recommended_first_participant_id) REFERENCES warm_intros.participants(introduction_id, id) ON DELETE RESTRICT'])
table('messages','Stable logical message slots: two requests and one final introduction. Neutral closure slots are created only when applicable. Reordering never changes a request’s participant.', '''
id|uuid|PRIMARY KEY|UUIDv7.
introduction_id|uuid|NOT NULL REFERENCES warm_intros.introductions(id) ON DELETE RESTRICT|Owning introduction.
kind|text|NOT NULL|request, final_introduction, or neutral_closure.
participant_id|uuid||Request/closure recipient; null for shared final introduction.
current_version_id|uuid||Current saved text version; composite FK added after versions exist.
approved_version_id|uuid||Frozen launch-approved version; immutable after start.
active_generation_run_id|uuid||Generation allowed to replace current text; stale runs cannot write through this pointer.
generation_status|text|NOT NULL|idle, queued, streaming, ready, failed, or cancelled.
created_at|timestamptz|NOT NULL DEFAULT now()|Creation time.
updated_at|timestamptz|NOT NULL DEFAULT now()|Last slot update.
''',constraints=['UNIQUE (introduction_id, id)','UNIQUE NULLS NOT DISTINCT (introduction_id, kind, participant_id)','FOREIGN KEY (introduction_id, participant_id) REFERENCES warm_intros.participants(introduction_id, id) ON DELETE RESTRICT'])
table('message_versions','Append-only saved draft and sent-message content. Each completed AI result or debounced human save produces a new version; keep all server-accepted versions, not every keystroke.', '''
id|uuid|PRIMARY KEY|UUIDv7.
introduction_id|uuid|NOT NULL REFERENCES warm_intros.introductions(id) ON DELETE RESTRICT|Owning introduction.
message_id|uuid|NOT NULL|Stable slot.
version|bigint|NOT NULL|Monotonic within message.
context_version_id|uuid|NOT NULL|WHY/order/profile context used when authored.
subject|text|NOT NULL|Exact saved subject, limit 160 Unicode characters in service.
body|text|NOT NULL|Exact plain-text note including paragraphs, greeting and sign-off; limit 3000 Unicode characters.
content_sha256|bytea|NOT NULL|Hash of canonical subject/body, never a substitute for stored text.
author_type|text|NOT NULL|ai, sender, or system_template.
author_user_id|uuid|REFERENCES users.users(id) ON DELETE SET NULL|Sender edit identity when applicable.
generation_run_id|uuid||AI provenance reference, when generated.
supersedes_version_id|uuid|REFERENCES warm_intros.message_versions(id) ON DELETE RESTRICT|Previous saved version for audit/review.
created_at|timestamptz|NOT NULL DEFAULT now()|Saved time.
''',constraints=['UNIQUE (introduction_id, id)','UNIQUE (message_id, id)','UNIQUE (message_id, version)','FOREIGN KEY (introduction_id, message_id) REFERENCES warm_intros.messages(introduction_id, id) ON DELETE RESTRICT','FOREIGN KEY (introduction_id, context_version_id) REFERENCES warm_intros.context_versions(introduction_id, id) ON DELETE RESTRICT'])
table('reviews','Append-only sender approval receipts. A review is current only when its message version and approval dependency hash match the current draft. Invalidation does not delete prior reviews.', '''
id|uuid|PRIMARY KEY|UUIDv7.
introduction_id|uuid|NOT NULL REFERENCES warm_intros.introductions(id) ON DELETE RESTRICT|Owning introduction.
message_id|uuid|NOT NULL|Approved slot.
message_version_id|uuid|NOT NULL|Exact text approved.
context_version_id|uuid|NOT NULL|Exact context viewed when approving; provenance is retained even if an unrelated address later changes.
approval_scope_sha256|bytea|NOT NULL|Canonical hash of this message text and its relevant people/order/WHY/address/sender dependencies. Start recomputes and compares it.
reviewed_by_user_id|uuid|NOT NULL REFERENCES users.users(id) ON DELETE RESTRICT|Must equal introduction owner.
reviewed_at|timestamptz|NOT NULL DEFAULT now()|Approval timestamp.
''',constraints=['UNIQUE (message_id, message_version_id, context_version_id)','FOREIGN KEY (introduction_id, message_id) REFERENCES warm_intros.messages(introduction_id, id) ON DELETE RESTRICT','FOREIGN KEY (message_id, message_version_id) REFERENCES warm_intros.message_versions(message_id, id) ON DELETE RESTRICT','FOREIGN KEY (introduction_id, context_version_id) REFERENCES warm_intros.context_versions(introduction_id, id) ON DELETE RESTRICT'])
table('invitations','Recipient-specific capability tied to one frozen invitation. Create the second invitation only after the first acceptance applies. No account is needed to resolve it.', '''
id|uuid|PRIMARY KEY|UUIDv7.
introduction_id|uuid|NOT NULL REFERENCES warm_intros.introductions(id) ON DELETE RESTRICT|Owning introduction.
participant_id|uuid|NOT NULL|Recipient, scoped by composite FK.
context_version_id|uuid|NOT NULL|Frozen launch context.
message_id|uuid|NOT NULL|Approved request slot; version supplied through frozen slot.
token_hash|bytea|NOT NULL UNIQUE|SHA-256 of a random 256-bit token; no plaintext token column.
token_version|integer|NOT NULL DEFAULT 1|Bind requests to this capability version.
state|text|NOT NULL|queued, active, decided, expired, or revoked.
first_send_attempt_at|timestamptz||Deadline starts when the immutable send payload is first frozen for dispatch.
expires_at|timestamptz||Exact deadline frozen before first attempt; set with payload in one transaction.
revoked_at|timestamptz||Revocation time, if stopped.
created_at|timestamptz|NOT NULL DEFAULT now()|Creation time.
''',constraints=['UNIQUE (introduction_id, id)','UNIQUE (introduction_id, participant_id)','FOREIGN KEY (introduction_id, participant_id) REFERENCES warm_intros.participants(introduction_id, id) ON DELETE RESTRICT','FOREIGN KEY (introduction_id, context_version_id) REFERENCES warm_intros.context_versions(introduction_id, id) ON DELETE RESTRICT','FOREIGN KEY (introduction_id, message_id) REFERENCES warm_intros.messages(introduction_id, id) ON DELETE RESTRICT'],indexes=['CREATE INDEX invitations_expiry_idx ON warm_intros.invitations(expires_at, id) WHERE state IN (\'queued\', \'active\')'])
table('consent_decisions','One immutable accept/decline per invitation. This records what was actually approved, independent of later mail outcomes.', '''
id|uuid|PRIMARY KEY|UUIDv7.
introduction_id|uuid|NOT NULL REFERENCES warm_intros.introductions(id) ON DELETE RESTRICT|Owning introduction.
invitation_id|uuid|NOT NULL UNIQUE|One winning decision; conflicting later responses cannot overwrite it.
decision|text|NOT NULL|accept or decline.
context_version_id|uuid|NOT NULL|Exact frozen context recipient decided on.
consent_copy_version|text|NOT NULL|Version of disclosure displayed when deciding.
consent_copy_snapshot|text|NOT NULL|Exact disclosure text, for historical reconstruction.
request_id|text|NOT NULL|Server correlation ID; not the invitation token.
decided_at|timestamptz|NOT NULL DEFAULT now()|Server-recorded receipt time.
applied_at|timestamptz||When prerequisites were confirmed and transition applied; deferred for send-outcome reconciliation.
''',constraints=['UNIQUE (introduction_id, id)','FOREIGN KEY (introduction_id, invitation_id) REFERENCES warm_intros.invitations(introduction_id, id) ON DELETE RESTRICT','FOREIGN KEY (introduction_id, context_version_id) REFERENCES warm_intros.context_versions(introduction_id, id) ON DELETE RESTRICT'])
table('decision_notes','Optional decline notes, private to the sender. Append revisions separately from immutable consent and from generic activity summaries.', '''
id|uuid|PRIMARY KEY|UUIDv7.
introduction_id|uuid|NOT NULL REFERENCES warm_intros.introductions(id) ON DELETE RESTRICT|Owning introduction.
decision_id|uuid|NOT NULL|Must reference a decline, enforced by service.
revision|bigint|NOT NULL|Monotonic note revision.
note|text|NOT NULL|Plain text, maximum 2000 Unicode characters; no automatic onward sharing.
created_at|timestamptz|NOT NULL DEFAULT now()|Submission time.
''',constraints=['UNIQUE (decision_id, revision)','FOREIGN KEY (introduction_id, decision_id) REFERENCES warm_intros.consent_decisions(introduction_id, id) ON DELETE RESTRICT'])
table('generation_runs','Durable generation queue and provenance for each of the three parallel LLM calls. A retry/fallback has a new run ID; retain failed and superseded runs.', '''
id|uuid|PRIMARY KEY|UUIDv7.
introduction_id|uuid|NOT NULL REFERENCES warm_intros.introductions(id) ON DELETE RESTRICT|Owning introduction.
message_id|uuid|NOT NULL|Target slot.
context_version_id|uuid|NOT NULL|Immutable input context; shared by the initial three runs.
base_message_version_id|uuid||Version this run may replace, null on first generation.
parent_run_id|uuid|REFERENCES warm_intros.generation_runs(id) ON DELETE RESTRICT|Retry/regeneration ancestry.
status|text|NOT NULL|queued, streaming, completed, failed, cancelled, superseded.
model_id|text|NOT NULL|Exact configured OpenRouter model slug.
provider_generation_id|text||Provider correlation ID when returned.
prompt_name|text|NOT NULL|Asset path/logical prompt name.
prompt_version|text|NOT NULL|Version label.
prompt_sha256|bytea|NOT NULL|Hash of exact system prompt asset.
input_snapshot|jsonb|NOT NULL|Exact permitted facts and WHY passed to this run; owner-private.
input_sha256|bytea|NOT NULL|Hash of sanitized model input, excluding execution order and private addresses; used for relevant-context staleness checks.
settings|jsonb|NOT NULL|Temperature, reasoning, token budget, timeout, provider policy and prompt asset snapshot/reference.
partial_subject|text|NOT NULL DEFAULT ''|Latest persisted coalesced stream output.
partial_body|text|NOT NULL DEFAULT ''|Latest persisted coalesced stream output; not reviewable yet.
usage|jsonb|NOT NULL DEFAULT '{}'::jsonb|Input/output/reasoning tokens and cost if reported; unknown remains null/absent.
finish_reason|text||Actual provider completion reason.
error_code|text||Safe machine error; no raw tokens or sensitive request dumps.
lease_until|timestamptz||Worker lease, heartbeat while streaming.
next_attempt_at|timestamptz|NOT NULL DEFAULT now()|Queue eligibility; bounded retry policy.
started_at|timestamptz||First model-call time.
completed_at|timestamptz||Terminal time, including failure.
created_at|timestamptz|NOT NULL DEFAULT now()|Enqueue time.
''',constraints=['UNIQUE (introduction_id, id)','UNIQUE (message_id, id)','FOREIGN KEY (introduction_id, message_id) REFERENCES warm_intros.messages(introduction_id, id) ON DELETE RESTRICT','FOREIGN KEY (introduction_id, context_version_id) REFERENCES warm_intros.context_versions(introduction_id, id) ON DELETE RESTRICT'],indexes=['CREATE INDEX generation_runs_due_idx ON warm_intros.generation_runs(next_attempt_at, id) WHERE status = \'queued\''])
table('stream_events','Replayable SSE transport. Short-lived chunks can be compacted after completion because final versions and run provenance remain; history is not dependent on chunks.', '''
introduction_id|uuid|NOT NULL REFERENCES warm_intros.introductions(id) ON DELETE RESTRICT|Stream scope; authorize before subscribing/replaying.
seq|bigint|NOT NULL|Allocate under introduction row lock in the same commit as run partial text; prevents commit-order gaps.
run_id|uuid||Generation identity for message deltas.
message_id|uuid||Composer routing identity, not column position.
kind|text|NOT NULL|snapshot, draft.started, draft.delta, draft.completed, draft.failed, draft.superseded, generation.completed.
payload|jsonb|NOT NULL|Typed event payload, no chain-of-thought or provider secrets.
created_at|timestamptz|NOT NULL DEFAULT now()|Commit time.
''',constraints=['PRIMARY KEY (introduction_id, seq)','FOREIGN KEY (introduction_id, run_id) REFERENCES warm_intros.generation_runs(introduction_id, id) ON DELETE RESTRICT','FOREIGN KEY (introduction_id, message_id) REFERENCES warm_intros.messages(introduction_id, id) ON DELETE RESTRICT'])
table('mail_deliveries','Durable outbox and one logical message send. The approved text, envelope, rendered HTML/text, and provider result remain inspectable even when retries occur.', '''
id|uuid|PRIMARY KEY|UUIDv7.
introduction_id|uuid|NOT NULL REFERENCES warm_intros.introductions(id) ON DELETE RESTRICT|Owning introduction.
message_id|uuid|NOT NULL|Logical slot.
message_version_id|uuid|NOT NULL|Exact text sent.
context_version_id|uuid|NOT NULL|Frozen context snapshot.
invitation_id|uuid||Request capability, null for final/closure.
logical_key|text|NOT NULL UNIQUE|Deterministic send identity reused on all transport retries.
state|text|NOT NULL|queued, sending, provider_accepted, retryable_failed, permanent_failed, unknown, suppressed.
template_name|text|NOT NULL|First request, second request, final, or neutral closure.
template_version|text|NOT NULL|Versioned renderer.
rendered_snapshot|jsonb|NOT NULL|Envelope, HTML and plain text with capability URL redacted in owner/history read models; exact text preserved separately in ciphertext.
payload_ciphertext|bytea||Exact provider request, including capability URL; required before dispatch, encrypted at rest.
encryption_key_version|text||Key version for decrypting exact payload.
payload_sha256|bytea||Hash of complete canonical provider request; stable on retry.
provider_email_id|text|UNIQUE|Resend ID; durable confirmation beyond its idempotency window.
provider_accepted_at|timestamptz||Send milestone.
delivery_facts|jsonb|NOT NULL DEFAULT '{}'::jsonb|Per-envelope-recipient delivered/bounce/complaint evidence; preserve distinct facts.
attempt_count|integer|NOT NULL DEFAULT 0|Cached count; attempt rows are the full record.
lease_until|timestamptz||Worker dispatch lease.
lease_token|uuid||Fencing identity; late worker completion cannot override a newer owner.
next_attempt_at|timestamptz|NOT NULL DEFAULT now()|Retry scheduling.
first_attempt_at|timestamptz||Start of provider idempotency safety window.
last_error_code|text||Safe operator code.
created_at|timestamptz|NOT NULL DEFAULT now()|Atomic enqueue with transition.
updated_at|timestamptz|NOT NULL DEFAULT now()|Last delivery update.
''',constraints=['UNIQUE (introduction_id, id)','FOREIGN KEY (introduction_id, message_id) REFERENCES warm_intros.messages(introduction_id, id) ON DELETE RESTRICT','FOREIGN KEY (message_id, message_version_id) REFERENCES warm_intros.message_versions(message_id, id) ON DELETE RESTRICT','FOREIGN KEY (introduction_id, context_version_id) REFERENCES warm_intros.context_versions(introduction_id, id) ON DELETE RESTRICT','FOREIGN KEY (introduction_id, invitation_id) REFERENCES warm_intros.invitations(introduction_id, id) ON DELETE RESTRICT'],indexes=['CREATE INDEX mail_deliveries_due_idx ON warm_intros.mail_deliveries(next_attempt_at, id) WHERE state IN (\'queued\', \'retryable_failed\')'])
table('delivery_attempts','Append-only record of every actual Resend API attempt. Attempts are not new logical emails.', '''
id|uuid|PRIMARY KEY|UUIDv7.
delivery_id|uuid|NOT NULL REFERENCES warm_intros.mail_deliveries(id) ON DELETE RESTRICT|Logical send.
attempt_number|integer|NOT NULL|Monotonic under delivery lock.
lease_token|uuid|NOT NULL|Worker ownership used for this attempt.
request_sha256|bytea|NOT NULL|Must match frozen delivery payload.
started_at|timestamptz|NOT NULL DEFAULT now()|Before network call.
finished_at|timestamptz||Null if process died; sweeper reconciles.
outcome|text|NOT NULL|in_flight, accepted, retryable_error, permanent_error, unknown.
http_status|integer||Null if no HTTP response.
provider_email_id|text||Response ID, if received.
error_code|text||Sanitized machine category.
retry_after_seconds|integer||Provider retry hint, when available.
''',constraints=['UNIQUE (delivery_id, attempt_number)'])
table('events','Permanent introduction timeline, separate from short-lived streaming chunks. Append in the same transaction as the state change.', '''
id|uuid|PRIMARY KEY|UUIDv7, stable cursor tiebreaker.
introduction_id|uuid|NOT NULL REFERENCES warm_intros.introductions(id) ON DELETE RESTRICT|Owning introduction.
event_type|text|NOT NULL|Canonical event name; examples documented below.
actor_type|text|NOT NULL|sender, recipient_capability, system_worker, provider.
actor_user_id|uuid|REFERENCES users.users(id) ON DELETE SET NULL|Known owner actor when relevant.
participant_id|uuid||Recipient identity when relevant.
message_id|uuid||Message involved.
delivery_id|uuid||Logical send involved.
context_version_id|uuid||WHY/context at this milestone.
causation_id|uuid||Decision/job/mutation that caused the event.
request_id|text||Cross-service trace correlation.
metadata|jsonb|NOT NULL DEFAULT '{}'::jsonb|Structured safe facts, version IDs and stage changes; no token, full note or raw draft body.
occurred_at|timestamptz|NOT NULL DEFAULT now()|Server event time.
''',constraints=['FOREIGN KEY (introduction_id, participant_id) REFERENCES warm_intros.participants(introduction_id, id) ON DELETE RESTRICT','FOREIGN KEY (introduction_id, message_id) REFERENCES warm_intros.messages(introduction_id, id) ON DELETE RESTRICT','FOREIGN KEY (introduction_id, delivery_id) REFERENCES warm_intros.mail_deliveries(introduction_id, id) ON DELETE RESTRICT','FOREIGN KEY (introduction_id, context_version_id) REFERENCES warm_intros.context_versions(introduction_id, id) ON DELETE RESTRICT'],indexes=['CREATE INDEX events_intro_timeline_idx ON warm_intros.events(introduction_id, occurred_at, id)'])
table('provider_events','Durable verified webhook inbox, including unmatched events arriving before the send receipt.', '''
id|uuid|PRIMARY KEY|UUIDv7.
provider_event_id|text|NOT NULL UNIQUE|Provider webhook delivery/event identity, used for deduplication.
provider_email_id|text|NOT NULL|Correlates to logical delivery when available.
delivery_id|uuid|REFERENCES warm_intros.mail_deliveries(id) ON DELETE RESTRICT|Nullable until correlation succeeds.
event_type|text|NOT NULL|sent/delivered/bounced/etc.; never a consent action.
provider_occurred_at|timestamptz|NOT NULL|Provider event time.
received_at|timestamptz|NOT NULL DEFAULT now()|Receipt time.
payload|jsonb|NOT NULL|Verified minimal event data, recipient details restricted to authorized operators.
status|text|NOT NULL|pending, applied, unmatched, ignored, failed.
processed_at|timestamptz||Application time.
error_code|text||Safe reconciliation error.
''',indexes=['CREATE INDEX provider_events_unmatched_idx ON warm_intros.provider_events(received_at, id) WHERE status IN (\'pending\', \'unmatched\', \'failed\')'])
table('mutation_receipts','Durable request idempotency for create, save, review, start, decisions, notes, archive and cancel. Store no bearer token in the scope.', '''
id|uuid|PRIMARY KEY|UUIDv7.
scope_type|text|NOT NULL|owner or invitation.
scope_id|uuid|NOT NULL|Verified owner user ID or resolved invitation ID.
operation|text|NOT NULL|Canonical operation, including target identity.
idempotency_key|text|NOT NULL|Validated client-generated request identity.
request_sha256|bytea|NOT NULL|Canonical body hash; changed replay is conflict.
introduction_id|uuid|REFERENCES warm_intros.introductions(id) ON DELETE RESTRICT|Committed resource, null before a create completes.
response_status|integer|NOT NULL|Original result code.
response_snapshot|jsonb|NOT NULL|Bounded result/receipt, no token or stale unrestricted source data.
created_at|timestamptz|NOT NULL DEFAULT now()|Commit time; same transaction as operation.
''',constraints=['UNIQUE (scope_type, scope_id, operation, idempotency_key)'])
extra=[
'ALTER TABLE warm_intros.introductions ADD FOREIGN KEY (id, current_context_version_id) REFERENCES warm_intros.context_versions(introduction_id, id) ON DELETE RESTRICT',
'ALTER TABLE warm_intros.introductions ADD FOREIGN KEY (id, launch_context_version_id) REFERENCES warm_intros.context_versions(introduction_id, id) ON DELETE RESTRICT',
'ALTER TABLE warm_intros.messages ADD FOREIGN KEY (id, current_version_id) REFERENCES warm_intros.message_versions(message_id, id) ON DELETE RESTRICT',
'ALTER TABLE warm_intros.messages ADD FOREIGN KEY (id, approved_version_id) REFERENCES warm_intros.message_versions(message_id, id) ON DELETE RESTRICT',
'ALTER TABLE warm_intros.messages ADD FOREIGN KEY (id, active_generation_run_id) REFERENCES warm_intros.generation_runs(message_id, id) ON DELETE RESTRICT',
'ALTER TABLE warm_intros.message_versions ADD FOREIGN KEY (message_id, generation_run_id) REFERENCES warm_intros.generation_runs(message_id, id) ON DELETE RESTRICT',
'ALTER TABLE warm_intros.generation_runs ADD FOREIGN KEY (message_id, base_message_version_id) REFERENCES warm_intros.message_versions(message_id, id) ON DELETE RESTRICT']
sql=['-- Warm Intro proposed schema. Documentation artifact only; not an applied migration.', '-- Generate actual goose migration filenames with make migration after schema review.', '-- UUIDv7 values are generated in Go. Status vocabularies are validated by services.', 'CREATE SCHEMA warm_intros;']
md=[]
for i,t in enumerate(T,1):
    lines=[f'    {c["name"]:<34} {c["type"]} {c["rule"]}'.rstrip() for c in t['columns']]+['    '+c for c in t['constraints']]
    sql+=['',f'-- {t["purpose"]}',f'CREATE TABLE warm_intros.{t["name"]} (',',\n'.join(lines),');']+[x+';' for x in t['indexes']]
    md += [f'<Accordion title="{i}. {t["name"]}">','',t['purpose'],'','| Column | Type / nullability | Meaning |','| --- | --- | --- |']
    for c in t['columns']:
        null='required' if 'NOT NULL' in c['rule'] or 'PRIMARY KEY' in c['rule'] else 'nullable'
        md.append(f'| `{c["name"]}` | `{c["type"]}` · {null} | {c["meaning"]} |')
    md+=['','**Keys and indexes:** '+('; '.join('`'+x+'`' for x in t['constraints']) if t['constraints'] else 'Primary key above.')]
    md += ['']+['- `'+x+'`' for x in t['indexes']]+['','</Accordion>','']
sql+=['','-- Deferred creation-order links; application inserts draft root before children.']+[x+';' for x in extra]
(root/'schema.sql').write_text('\n'.join(sql)+'\n')
(root/'schema.json').write_text(json.dumps(T,indent=2)+'\n')
(root/'tables.mdx').write_text('\n'.join(md))
print(f'{len(T)} tables; {sum(len(t["columns"]) for t in T)} columns; SQL and field dictionary generated.')
