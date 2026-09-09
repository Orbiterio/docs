#!/usr/bin/env python3
"""Validate the docs handoff package; never claim runtime evals have passed."""

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "assets/video-game-waterfall"


def read_json(path):
    return json.loads(path.read_text())


def require(condition, message):
    if not condition:
        raise SystemExit(f"FAIL: {message}")


def main():
    catalog = read_json(BASE / "build-evals.json")
    contract = read_json(BASE / "type-source-contract.json")
    freeze = read_json(BASE / "build-freeze.json")
    phases = catalog["phases"]
    cases = catalog["cases"]
    case_by_id = {case["id"]: case for case in cases}
    require(len(case_by_id) == len(cases), "duplicate eval case ID")
    require(len(cases) == catalog["required_case_count"], "wrong required case count")
    require([phase["id"] for phase in phases] == list(range(9)), "expected phases 0-8")
    covered = []
    for phase in phases:
        number = phase["id"]
        require(phase["depends_on"] == ([] if number == 0 else [number - 1]),
                f"phase {number} dependency must preserve ordered gates")
        require(phase["case_ids"], f"phase {number} has no required evals")
        require(phase["status"] == "not_run", "catalog is a plan, not an execution receipt")
        require(phase["gate"]["required_pass_percent"] == 100, "gate was weakened")
        require(phase["gate"]["allowed_missing_or_skipped_required_cases"] == 0,
                "missing or skipped cases cannot pass")
        for identifier in phase["case_ids"]:
            require(identifier in case_by_id, f"missing case {identifier}")
            case = case_by_id[identifier]
            require(case["phase"] == number and case["required"], f"bad phase assignment {identifier}")
            require(case["status"] == "not_run", f"planned case {identifier} claims execution")
            for field in ("given", "when", "expected", "data_kind", "evidence_required"):
                require(bool(case[field]), f"missing {field}: {identifier}")
            require(len(set(case["assertion_surfaces"])) == 4, f"incomplete surfaces: {identifier}")
            covered.append(identifier)
    require(sorted(covered) == sorted(case_by_id), "cases omitted or repeated across phases")
    for group, items, name_key in (("nodes", contract["node_types"], "label"),
                                   ("edges", contract["edges"], "type")):
        expected = {item[name_key] for item in items}
        require(set(catalog["coverage"][group]) == expected, f"{group} coverage mismatch")
        require(len(expected) == (6 if group == "nodes" else 15), f"unexpected {group} count")
        for item in items:
            identifiers = catalog["coverage"][group][item[name_key]]
            require(identifiers and set(identifiers) <= case_by_id.keys(), f"unknown {group} cases")
            require(item["build_eval_case_ids"] == identifiers, f"contract drift: {item[name_key]}")
    require(len(catalog["coverage"]["primary_adapters"]) == 4, "primary adapter coverage missing")
    for identifiers in catalog["coverage"]["primary_adapters"].values():
        require(identifiers and set(identifiers) <= case_by_id.keys(), "unknown adapter eval")
    node_types = {item["label"]: item for item in contract["node_types"]}
    for label in ("Video_Game", "Game_Series", "Game_Award"):
        require(node_types[label]["standalone_card"], f"missing approved card {label}")
    for label in ("Game_Platform", "Game_Engine", "Game_Release"):
        require(not node_types[label]["standalone_card"], f"unapproved card {label}")
    require(contract["implementation"]["xano_dependency"] is False, "Xano dependency introduced")
    require(contract["implementation"]["recursive_discovery"] is False, "recursive discovery enabled")
    require(contract["root_limits"]["llm_attempts"] == 10, "LLM root limit drift")
    require(contract["root_limits"]["downloaded_source_body_bytes"] == 10 * 1024 * 1024,
            "source-byte root limit drift")
    guide = "guides/open-work/video-game-waterfall-build-guide"
    navigation = json.dumps(read_json(ROOT / "docs.json"))
    require(navigation.count(f'"{guide}"') == 1, "guide must have one navigation entry")
    for path in (guide + ".mdx", "guides/ontology/nodes.mdx", "guides/ontology/edges.mdx"):
        require((ROOT / path).is_file(), f"missing reference file {path}")
    require("## Build agent: start here" in (ROOT / "guides/open-work/video-game-waterfall.mdx").read_text(),
            "main page lacks agent entry point")
    require(freeze["kind"] == "documentation_freeze_not_runtime_validation", "wrong freeze status")
    for item in freeze["documents"]:
        path = ROOT / item["path"]
        require(path.is_file(), f"missing frozen file {item['path']}")
        actual = hashlib.sha256(path.read_bytes()).hexdigest()
        require(actual == item["sha256"], f"freeze hash changed: {item['path']}; review and regenerate inventory")
    print(f"PASS: documentation handoff — 9 phases, {len(cases)} planned evals, 6 node and 15 edge families")
    print("Runtime evals: NOT RUN. These checks do not authorize or validate deployment.")


if __name__ == "__main__":
    main()
