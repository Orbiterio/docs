# Edge reference refresh

The September 22, 2026 snapshot is aggregate-only data from the graph configured by dev Universe AlloyDB. It is not a production-wide audit. No entity names, UUIDs, evidence text, credentials or descriptions are included.

Files:

- `edge-weights.csv`: registered, implemented and documented endpoint/scope variants. `is_range=yes` includes discrete tiers; `notes` supplies the choices/formula. Empty weights mean unweighted or unspecified, never zero.
- `edge-weights-observed.csv`: actual counts and weight ranges, one row per relationship type.
- `edge-properties-observed.csv`: property presence counts by relationship type. Presence does not certify validity or prove the property is required.
- `graph-audit-2026-09-22.json`: timestamp, scope, exact read-only queries and aggregate results.
- `edge-reference.json`: machine-readable inventory with the audited Universe revision.

To refresh code-derived tables from the local checkout:

```sh
python3 scripts/sync-universe-edge-reference.py \
  --universe ../orbiter-universe \
  --graph-audit files/graph/graph-audit-2026-09-22.json
```

The script reads the registry via Go, writes CSV/JSON and the Mintlify snippet, and never connects to a graph. It preserves the supplied graph timestamp rather than claiming a new graph inspection. Counts/min/max in the main CSV are type-wide and repeated for endpoint variants: do not add them together.

For a new audit, review the actual `internal/platform/graph` writers and feature callers, especially endpoint constraints, merge keys, weight update behavior, evidence fields and description receipts. Review the explicit writer corrections and docs-only entries in the generator before regenerating; registry status is not deployment proof. Capture a new dated snapshot using `GRAPH.EXPLAIN` followed by `GRAPH.RO_QUERY` with a bounded timeout. Read connection settings privately from the environment's configuration; never commit credentials. Do not mutate or backfill the graph as part of documentation maintenance.

Update the current-audit sections in both ontology pages with any changed findings. Keep legacy snippets explicitly historical and proposals separate. Run `mint validate`, then each changed page's `mint broken-links --files ... --check-anchors`, sequentially. Do not edit script-managed backend navigation.
