# Revision input policy — deterministic application contract, not a third model call

Use the same request/final system prompt for regeneration. Supply revision_request
as bounded user data (maximum 500 characters), the current saved draft as
source_reference_draft, and the SAME authorized current context snapshot.

Require expected_revision and explicit overwrite intent before starting a run
that may replace human edits. Do not delete the current saved version. Stream a
candidate in a separate buffer, then commit it only if the generation run still
owns the target slot and its sanitized input hash and base text version are unchanged. Preserve both
versions in message_versions and invalidate the current review on replacement.

If relevant model-input context changed or the sender edited during generation, mark the run
superseded; retain its output/provenance for history but do not overwrite text.

There is no LLM prompt for acceptance, decline, choosing a send stage, email
headers, token creation, idempotency, final dispatch, or closure. Those are Go
rules and versioned templates.
