# Pre-build QA results — September 25, 2026

The plan was reviewed against the user-selected Ethan Jacks / Katelyn Gallanty Leverage Loop UI, the exact v2 sample payload and source schema. The UI headline and all four summary paragraphs were compared and matched before fixture extraction.

## Fixed in the proposal

- Preserve WHY as `{headline, body[]}` in original and working JSONB versions, with explicit source identity mapping.
- Use actual source people/rationale for three independent model-input fixtures and authored expected drafts. The request copy works in both orders.
- Pin reviewed email/public/consent assets across deployments and freeze each public invitation view.
- Add generation lease fencing and explicit dispatch holds for failures or eligibility loss.
- Reject cross-message ancestry/streaming references and cross-owner restart references.
- Serialize three-composer autosaves; resolve idempotency receipts before checking a new mutation's revision.
- Specify public timeout/receipt/expiry behavior, delivery attribution limits and operator recovery boundaries.
- Move template/preview implementation ahead of dependent UI integration.

## Fixed in the third pass (builder's-lens underspecification)

- Replace single-value `dispatch_block_reason` with `dispatch_holds` JSONB cause set, mutated only under the introduction lock; same 16-table/216-column/63-FK footprint.
- Enumerate the 12-state lifecycle vocabulary; redefine `current_stage` as the derived furthest-stage marker frozen at terminal close so history keeps where a sequence stopped.
- Emit column-level foreign keys in the generated field dictionary (`delivery_attempts`, `provider_events`, `mutation_receipts`, external `users`/`persons`/`suggestions` references) via `schema-design.py`.
- Add partial lease-sweep indexes on `lease_until` for `streaming` generation runs and `sending` mail deliveries; document the PostgreSQL 15+ requirement for `UNIQUE NULLS NOT DISTINCT`.
- Complete the API contract: add `stream`, `archive`, `restore`, `generation/cancel` routes; unify generation verbs under `/generation`; enumerate `status` rollup filters, `validation_issues` codes, and `event_type` V1 vocabulary.
- Define shared formats: canonical-hash helper contract, `source_key` composition, `#k=` fragment token URL, `logical_key` context-version component, discriminated mutation payloads.
- Link UI build steps and routes to the design page sections (setup §1, public invitation, tracking §4, breakpoints/accessibility) and add the state→tracking-label bridge table.
- Specify template variable content (`Preheader`/`Footer`/`ExpiresAtLabel`/`InvitationURL` derivation, `SignatureLines` frozen in `sender_snapshot`, full-display-name From).
- Define `failed`-sequence closure rule: no automatic closure once final dispatch began; failure-notification template moved to decisions-to-settle.
- Clarify nullability semantics: `payload_ciphertext`/`payload_sha256` populated at payload freeze inside the dispatch transaction; `mutation_receipts.introduction_id` populated for committed introduction-scoped mutations.

## Evidence

- Disposable PostgreSQL: 16 tables, 216 columns, 63 foreign keys — re-verified after the third-pass `dispatch_holds`/lease-index changes.
- The original schema's cross-message revision-ancestry defect was reproduced before the fix. Revised DDL rejects seven invalid/duplicate reference cases.
- Actual WHY headline and four paragraphs survive versioned edits, archive, contact deletion and source deletion; root deletion remains restricted.
- Three input fixtures preserve the complete WHY and exclude emails/private intent. Authored expected requests preserve the business rationale and pass static order/length checks.
- Six email cases render in HTML and plain text (four message types plus reversed invitation order), with escaping, capability, stage-banner and missing-field checks.
- Six cases fit 320, 390 and 800 px in Chromium. This is not email-client delivery validation.

- Full `mintlify validate` and focused `mintlify broken-links --files ... --check-anchors` passed.
- MDX compilation, prompt/field dictionary consistency and ZIP/source byte equality passed.

## Still implementation/release gates

Real model quality and latency, consent/worker race tests, API authorization, actual Resend delivery and inbox behavior, account lifecycle integration and operational recovery. Product choices still include post-acceptance send-age limits, retention, withdrawal policy and whether additional sender notifications are needed.

No application migrations, application deployment, model calls or email sends were made by this review. Authored expectation drafts are not represented as model output.
