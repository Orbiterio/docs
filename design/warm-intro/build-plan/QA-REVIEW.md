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

## Evidence

- Disposable PostgreSQL: 16 tables, 216 columns, 63 foreign keys.
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
