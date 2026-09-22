# Universe edge audit: developer handoff

Inspected Universe `bb0fc045` on September 22, 2026. No Universe code or graph data was modified. Documentation and exports were updated separately.

## Required: correct recency direction

Mark confirmed: **lower weight = stronger; older work must have higher weight**. Two current registry ladders implement the opposite. Preserve existing age boundaries and weight sets, but reverse the tier assignment:

| Edge | Age / state | Current incorrect value | Proposed corrected value |
| --- | --- | ---: | ---: |
| CONTRIBUTED_TO | Current, or age ≤0 | 40 | 15 |
| CONTRIBUTED_TO | 1 year | 35 | 20 |
| CONTRIBUTED_TO | 2 years | 30 | 25 |
| CONTRIBUTED_TO | 3 years | 25 | 30 |
| CONTRIBUTED_TO | 4 years | 20 | 35 |
| CONTRIBUTED_TO | 5+ years | 15 | 40 |
| AUTHORED | ≤1 year | 25 | 15 |
| AUTHORED | 2–3 years | 22 | 18 |
| AUTHORED | 4–6 years | 18 | 22 |
| AUTHORED | 7+ years | 15 | 25 |

1. **Registry:** update `ContributedTo.Tiers` and `Authored.Tiers` in `internal/kernel/edges/edges.go`. The helper functions already select the correct age bucket; the assigned values are reversed. The direction is required; the proposed numbers above preserve the existing bands.
2. **Tests:** replace the existing expectation “CONTRIBUTED_TO steps down per year” in `internal/kernel/edges/edges_test.go`. Cover every boundary, ongoing work, future dates, and a monotonic invariant: an older otherwise-equivalent completed work must never have a lower cost. Also exercise the project/publication callers in `internal/features/enrichment/person/steps_credentials.go`.
3. **Reference year:** that caller hardcodes `gradingReferenceYear = 2026`. Decide and implement a reproducible, injected as-of date/year if weights are meant to age over time; tests can use a fixed clock without freezing runtime forever. Scheduled recomputation is needed for already-materialized edges to age even after this change.
4. **Undated records:** current callers treat missing dates as current. Do not confuse missing evidence with recent evidence. Confirm the intended unknown-date policy before changing it; the tier reversal alone otherwise retains this behavior and gives undated records the strongest tier.
5. **Existing data:** plan a bounded, dry-run-first reconciliation of `AUTHORED` and `CONTRIBUTED_TO` from authoritative credential dates/state. Do not blindly invert every stored number: age boundaries, ongoing/undated records, and historical writers differ. The snapshot contains 349 AUTHORED and 206 CONTRIBUTED_TO edges. `MergeCredentialEdge` sets `r.weight` on replay, but also invokes the description guard; do not assume replay will bypass missing description/evidence dependencies. Preserve UUIDs, creation timestamps, evidence, unrelated fields and consumer projection consistency. Report counts and skipped reasons. No backfill has been run.

## Registry / implementation drift to reconcile

- `ProducedStage`: registry says `Film_TV:stage` and Planned; `MergeProduced` targets `Stage_Production` and is implemented.
- Add the implemented Person → Stage_Production `WORKED_ON` 30 variant to the inventory.
- Replace the **unbuilt media** `PartOf` proposal with accepted `SESSION_OF` 30. Keep User-graph/project `PART_OF` separate; this is not a request to rename all PART_OF edges.
- Review misleading `Live`/historical notes, especially `SameAs` (“not ported”) and App-only entries. A registry status is not evidence of deployment in every environment.
- `AuthoredWeight` uses ≤1/≤3/≤6-year cutoffs; legacy Xano documentation used current/≤2/≤4. Preserve the Go boundaries unless a separate policy decision changes them.

## Description data gap

The inspected dev Universe graph has 24,755 edges / 56 types; 6,304 have missing or blank descriptions. The dedicated edge-description model is already `z-ai/glm-5.3-flash`, reasoning `low`. Current guarded writes store receipt/hash/source/upgrade-pending metadata and can use an accepted-relation fallback. Do not claim all historical data has been migrated.

A description backfill is separate work: inspect family-specific source evidence and the current ledger/receipt contract, avoid invented prose or fake model receipts, and report pending/error counts. No graph writes were made in this audit.

## Documentation follow-through

After developer changes, refresh `scripts/sync-universe-edge-reference.py` in the docs repo, including its explicit exception/recency notes; regenerate the CSV and snippet, and update both ontology pages. Use a new dated read-only graph snapshot after reconciliation. The current snapshot deliberately records pre-fix data, not the intended corrected behavior.

## Suggested validation commands

From `orbiter-universe`:

```sh
go test ./internal/kernel/edges ./internal/features/enrichment/person ./internal/platform/graph
```

Use the repository's existing lint/check targets for any changed Go files. Test a seeded local graph before the live reconciliation: re-running must preserve identity and leave already-correct weights unchanged. Include cancellation/retry and missing-evidence cases. Capture a dry-run report, then a post-run report with intended/actual values per age bucket and counts of updates, no-ops and skipped rows. A simple min/max check is insufficient because reversing the ladder does not change its bounds.

From the docs repository, run sequentially:

```sh
python3 scripts/sync-universe-edge-reference.py --universe ../orbiter-universe --graph-audit files/graph/graph-audit-2026-09-22.json
mint validate
mint broken-links --files guides/ontology/edges.mdx --check-anchors
mint broken-links --files guides/ontology/edge-weights.mdx --check-anchors
```

Use the new audit filename when fresh graph verification is available. Do not label the September 22 pre-fix snapshot as post-fix evidence. Include implementation, test results, the reconciliation plan/results, and synchronized documentation in the developer handoff back to Mark.
