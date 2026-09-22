#!/usr/bin/env python3
"""Refresh the code-derived edge inventory; never connects to or mutates a graph."""
import argparse
import csv
import json
from pathlib import Path
import subprocess
import tempfile


ROOT = Path(__file__).resolve().parents[1]
BASE = "https://github.com/Orbiterio/orbiter-universe/blob/"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--universe", type=Path, required=True)
    parser.add_argument("--graph-audit", type=Path, required=True,
                        help="Existing aggregate-only GRAPH.RO_QUERY snapshot")
    args = parser.parse_args()
    universe = args.universe.resolve()
    revision = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=universe, text=True).strip()
    dirty = subprocess.check_output(["git", "diff", "HEAD", "--", "internal/kernel/edges", "internal/platform/graph", "internal/platform/llm"], cwd=universe, text=True)
    if dirty:
        raise SystemExit("Commit or separately audit source changes before attributing them to a revision.")
    # Go evaluates computed tiers, so the export cannot silently miss pastRanks().
    with tempfile.TemporaryDirectory(prefix="edge-doc-export-", dir=universe / "scripts") as temp:
        folder = Path(temp)
        (folder / "main.go").write_text('package main\nimport("encoding/json";"os";"orbiter-universe/internal/kernel/edges")\nfunc main(){if err:=json.NewEncoder(os.Stdout).Encode(edges.All());err!=nil{panic(err)}}\n')
        registry = json.loads(subprocess.check_output(["go", "run", "./" + str(folder.relative_to(universe))], cwd=universe, text=True))
    audit = json.loads(args.graph_audit.read_text())
    headers, values, *_ = audit["results"]["weights"]
    observed = {row[0]: dict(zip(headers, row)) for row in values}
    rows = []
    for edge in registry:
        tiers = edge["Tiers"] or {}
        weights = sorted(set(tiers.values()))
        weight = str(edge["Weight"]) if edge["Weight"] else "; ".join(map(str, weights))
        kind = "tiered" if tiers else "fixed" if edge["Weight"] else "unweighted" if edge["Unweighted"] else "unspecified"
        note = "; ".join(f"{key}={value}" for key, value in sorted(tiers.items()))
        if edge["Note"]:
            note += ("; " if note else "") + "Registry note: " + edge["Note"]
        if edge["Type"] in ("HAS_EXPERTISE", "SPECIALIZES_IN"):
            weight, kind = "10–50", "formula range"
            note = "New node=10; matched=min(round(10 + distance*160),50), assuming nonnegative vector distance."
        if edge["Type"] == "AUTHORED":
            note = "IMPLEMENTATION BUG: age <=1y:25; <=3y:22; <=6y:18; older:15. Undated:25. Required direction: older work has HIGHER cost. Proposed corrected tiers:15/18/22/25. Code unchanged."
        if edge["Type"] == "CONTRIBUTED_TO":
            note += "; IMPLEMENTATION BUG: current/undated or age<=0:40; required direction is older=HIGHER cost. Proposed corrected tiers:15/20/25/30/35/40. Code unchanged."
        rows.append(dict(edge_type=edge["Type"], from_type=edge["From"], to_type=edge["To"], weight=weight,
                         is_range="yes" if tiers else "no", weight_kind=kind, status="registry:" + edge["Status"],
                         scope="Universe registry", notes=note,
                         source=BASE + revision + "/internal/kernel/edges/edges.go"))

    # Explicit, reviewed corrections: registry flags are not deployment evidence.
    for row in rows:
        if row["edge_type"] == "PRODUCED" and row["to_type"] == "Film_TV:stage":
            row.update(to_type="Stage_Production", status="writer implemented; registry stale",
                       notes=row["notes"] + "; MergeProduced uses Stage_Production, not Film_TV:stage.",
                       source=BASE + revision + "/internal/platform/graph/stage.go")
        if row["edge_type"] == "PART_OF":
            row.update(status="superseded registry proposal", notes="Media proposal was renamed SESSION_OF in the accepted 2026-09-18 docs; no media PART_OF/SESSION_OF writer found in this audit.")
        if row["edge_type"] == "KNOWS":
            row["scope"] = "Legacy App contract in Universe registry"
            row["notes"] += "; not the newer User→Person KNOWS formula; App writer not audited"

    def add(edge, source_type, target, weight, kind, status, scope, notes, source):
        rows.append(dict(edge_type=edge, from_type=source_type, to_type=target, weight=weight,
                         is_range="yes" if "range" in kind or kind == "tiered" else "no", weight_kind=kind,
                         status=status, scope=scope, notes=notes, source=source))

    add("WORKED_ON", "Person", "Stage_Production", "30", "fixed", "writer implemented", "Universe writer",
        "MergeStageWorkedOn; endpoint pair + role + character key; weight stamped on creation.", BASE + revision + "/internal/platform/graph/stage.go")
    for edge, source_type, target, weight in [
        ("PRODUCTION_OF", "Stage_Production", "Theatrical_Work", "50"),
        ("STAGED_AT", "Stage_Production", "Place:Venue:Theatre", "50"),
        ("WROTE", "Person|Music_Group", "Theatrical_Work", "10"),
        ("COMPOSED", "Person|Music_Group", "Theatrical_Work", "8"),
        ("WROTE_LYRICS", "Person|Music_Group", "Theatrical_Work", "12"),
        ("SESSION_OF", "MediaAppearance", "Event:Live", "30"),
    ]:
        add(edge, source_type, target, weight, "fixed", "documented proposal", "Documentation only",
            "No matching endpoint-specific writer found in this audit; do not infer deployment.", "guides/ontology/edges.mdx")
    add("WAS_FOUNDED", "contextFounded", "Company", "1", "fixed", "historical only", "Legacy graph audit",
        "Accepted legacy Xano contract; absent from current Universe registry and not observed in dev snapshot. Legacy writer not re-audited.", "guides/ontology/edge-weights.mdx")
    add("ADAPTED_FROM", "Theatrical_Work", "Work", "55", "fixed", "superseded proposal", "Documentation only",
        "Replaced by BASED_ON on 2026-09-07. Do not emit both names.", "guides/ontology/edges.mdx#adapted_from")
    add("KNOWS", "User", "Person", "25–60", "formula range", "documented contract; App not audited", "User graph",
        "25 + 35*(1-strength/100), strength 0–100.", "guides/ontology/edges.mdx#user-graph-edges")
    add("FOLLOWS", "User", "Company", "25–60", "derived range", "documented contract; App not audited", "User graph",
        "Minimum contributing KNOWS weight; empty contributor set has no value specified here.", "guides/ontology/edges.mdx#user-graph-edges")
    for edge, source_type, target in [
        ("CONNECTED_ON_ORBITER", "User", "Person"), ("CONNECTED_ON_LINKEDIN", "User", "Person"),
        ("CREATED", "User", "Note"), ("RECEIVED", "User", "Note"), ("UPLOADED", "User", "Document"),
        ("SAVED", "User", "Document"), ("ABOUT", "Note|Document", "Person|Company"),
        ("ATTACHED_TO", "Note|Document", "Person|Company"), ("COLLECTED", "User", "Entity")]:
        add(edge, source_type, target, "", "unweighted", "documented contract; App not audited", "User graph",
            "No weight by design; blank is not zero.", "guides/ontology/edges.mdx#user-graph-edges")
    for edge in ("OWNS", "INVOLVES", "PART_OF"):
        add(edge, "Project-related", "Project-related", "", "unspecified", "reserved", "User graph",
            "Reserved project relation; no weight specified.", "guides/ontology/edges.mdx#user-graph-edges")
    for edge in ("RELATED_TO", "MARRIED_TO"):
        add(edge, "User", "Person|Entity", "", "unspecified", "future user-defined contract", "User graph",
            "Do not inherit the Universe Person→Person weight.", "guides/ontology/edges.mdx#user-graph-edges")

    fields = list(rows[0]) + ["observed_type_count", "observed_type_min", "observed_type_max", "observed_at"]
    for row in rows:
        sample = observed.get(row["edge_type"]) if row["scope"].startswith("Universe") else None
        row.update(observed_type_count=sample["count"] if sample else "", observed_type_min=sample["min_weight"] if sample else "",
                   observed_type_max=sample["max_weight"] if sample else "", observed_at=audit["checked_at"] if sample else "")
    rows.sort(key=lambda r: (r["edge_type"], r["scope"], r["from_type"], r["to_type"]))
    output = ROOT / "files/graph"
    output.mkdir(parents=True, exist_ok=True)
    def write_csv(name, headers, records):
        with (output / name).open("w", encoding="utf-8-sig", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            writer.writeheader()
            writer.writerows(records)
    write_csv("edge-weights.csv", fields, rows)
    prop_headers, properties, *_ = audit["results"]["properties"]
    write_csv("edge-properties-observed.csv", prop_headers, [dict(zip(prop_headers, p)) for p in properties])
    write_csv("edge-weights-observed.csv", headers, [dict(zip(headers, r)) for r in values])
    (output / "edge-reference.json").write_text(json.dumps(dict(universe_revision=revision, graph_checked_at=audit["checked_at"], rows=rows), indent=2) + "\n")
    total = sum(r[1] for r in values)
    missing = sum(int(r[-1]) for r in values)
    lines = [f"Code reference: Universe `{revision[:8]}`. Graph checked: **{audit['checked_at']}** (dev Universe configuration; not an audit of every environment).",
             "", f"**{len(rows)} endpoint/scope variants** in the CSV; **{len(values)} observed relationship types, {total:,} edges**, including **{missing:,} with missing/blank descriptions**.", "",
             "[Download all edge weights](/files/graph/edge-weights.csv) · [Observed weights and counts](/files/graph/edge-weights-observed.csv) · [Observed property coverage](/files/graph/edge-properties-observed.csv)", "",
             "`registry:live` is the registry's own status, not proof of a deployed writer. A missing observed row means *not observed*, not *unimplemented*. CSV observed counts/min/max are **type-wide**, repeated across endpoint variants; do not sum those rows. Blank weights are explicitly unweighted or unspecified. `is_range=yes` includes discrete tiers; consult the tier notes rather than assuming every intermediate value is allowed.", "",
             "| Edge | From → To | Weight | Kind | Source status / scope |", "| --- | --- | --- | --- | --- |"]
    def cell(v):
        return str(v).replace("|", " / ").replace("\n", " ")
    for row in rows:
        lines.append("| " + " | ".join(cell(x) for x in ["`" + row['edge_type'] + "`", row['from_type'] + " → " + row['to_type'], row['weight'] or "—", row['weight_kind'], row['status'] + "; " + row['scope']]) + " |")
    (ROOT / "snippets/ontology/universe-edge-reference.mdx").write_text("\n".join(lines) + "\n")
    print(f"Wrote {len(rows)} edge variants, {len(properties)} observed property rows; Universe {revision[:8]}.")


if __name__ == "__main__":
    main()
