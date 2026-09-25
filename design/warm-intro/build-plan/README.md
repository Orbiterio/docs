# Warm Intro build package

Schema and implementation proposal, September 25, 2026. The design baseline is Direction 1: three mini email composers, horizontal stages, mobile invitation and tracking modal.

This package is documentation and implementation reference. No application database migration, deployment, model call or email send was performed by producing it.

## Start with tables

- `schema.sql`: proposed PostgreSQL schema, 16 tables / 216 columns; not a timestamped production migration.
- `schema.json`: machine-readable column dictionary, constraints and indexes.
- `schema-design.py`: single definition source for SQL and the field dictionary; run it to regenerate `schema.sql`, `schema.json` and `tables.mdx`.
- `schema-verification.json`: actual isolated PostgreSQL validation evidence and limits.
- `verify-schema.py`: repeatable schema/retention fixture check. It creates its own temporary PostgreSQL cluster on a private Unix socket and removes it afterward. It never connects to an Orbiter database.

The primary fixture is the actual Ethan Jacks / Katelyn Gallanty Leverage Loop from the user-selected documentation. WHY is JSONB `{headline, body[]}`, not flattened text. The primary record preserves every introduction attempt. Context versions retain the original natural-language WHY, working connection rationale, separate sender intent, and exactly what was approved. Message versions, reviews, decisions, notes, sends, attempts and permanent events retain full history. Archival is not deletion. Stream-event compaction does not erase product history.

See `QA-REVIEW.md` for findings, actual checks and remaining runtime gates.

## Actual source fixtures

- `fixtures/leverage-loop-ethan-katelyn.json`: exact source headline, four summary paragraphs and make_intro action; source IDs remain placeholders.
- `fixtures/model-inputs.json`: three independent inputs with full structured WHY and no email addresses/private context.
- `fixtures/expected-drafts.json`: authored order-neutral expected copy, not model output.
- `verify-fixtures.py`: validates the source/action mapping, input preservation, privacy boundaries and authored expectation properties.
- Sending is disabled; any future transport exercise must use controlled test inboxes, never these real contact addresses. `.invalid` values are deliberate non-sendable overrides.

## Then implement the plan

The canonical detailed plan is `guides/open-work/warm-intro-feature/warm-intro-build-plan.mdx` in Orbiterio/docs. It contains the field dictionary, proposed API contracts, state transitions, parallel streaming/replay protocol, system prompts, HTML/text templates, 16 ordered build steps, acceptance gates and configuration inventory.

- `model-config.json`: proposed initial model, concurrency, streaming, retry and quota settings. Validate in staging; these are not benchmark results.
- `prompts/warm-intro-request.md`: used in two independent simultaneous calls, one per recipient.
- `prompts/warm-intro-final.md`: third simultaneous call for the final handoff; does not depend on the first two outputs.
- `prompts/warm-intro-revision-policy.md`: deterministic regeneration/supersession contract, not another model call.
- `emails/`: four Go HTML templates and their plain-text fallbacks for Resend.
- `validate-templates.go`: offline fixture renderer and basic required-field/escaping checks. Run `go run validate-templates.go` from this directory.
- `rendered/`: actual Ethan/Katelyn names and rationale rendered with fixture-only capability URLs; includes both invitation orders. No real invitations or sending.

Use Go `html/template` with automatic escaping for HTML and `text/template` for text, both with missing-key errors. Server-validate actual link origins and envelope addresses. Never trust arbitrary model-generated HTML. Keep exact request bytes encrypted and stable across provider retries.

## Verified in this documentation task

- The reference DDL creates all tables and 63 foreign keys on an isolated local PostgreSQL cluster with minimal external-key fixtures.
- WHY versions survive contact/suggestion removal; snapshot identity survives, and root history deletion is restricted.
- All four HTML and all four text templates render; required fields fail closed and hostile strings escape.
- Seven invalid/duplicate reference cases are rejected, including cross-message ancestry and cross-owner restarts.
- The detailed MDX page compiles with the installed MDX compiler.

Application transitions, source authorization, concurrency, model quality/latency, mobile app behavior, Resend delivery/webhooks and inbox-client compatibility still require implementation and staging tests. Nothing in these fixture results claims those systems are already built.
