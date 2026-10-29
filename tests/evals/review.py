"""Human checklist worksheet for M4/M5; no uncalibrated model-as-judge scores."""
import argparse
import csv
import hashlib
import json
from pathlib import Path
from tests.evals.metrics import proportion


def fingerprint(content):
    return hashlib.sha256(json.dumps(content, ensure_ascii=False, sort_keys=True).encode()).hexdigest()


def draft_index(rows):
    return {(r["id"], str(r["repeat"]), c["platform"]): c
            for r in rows if "needs_context" not in r.get("tags", [])
            for c in r.get("generation", {}).get("contents", [])}


def score_reviews(rows, path):
    index = draft_index(rows)
    seen = set()
    edit_free = hallucinations = 0
    with Path(path).open(encoding="utf-8-sig", newline="") as stream:
        for review in csv.DictReader(stream):
            key = review["id"], review["repeat"], review["platform"]
            if key not in index or key in seen:
                raise ValueError("Unknown or duplicate reviewed draft")
            if not review["reviewer"].strip() or not review["reason"].strip():
                raise ValueError("Reviewer identity and checklist evidence are required")
            if review["output_sha256"] != fingerprint(index[key]):
                raise ValueError("Review refers to a different model output")
            if review["edit_free"] not in ("0", "1") or review["has_hallucination"] not in ("0", "1"):
                raise ValueError("Complete binary human labels; blank labels are not scores")
            seen.add(key)
            edit_free += int(review["edit_free"])
            hallucinations += int(review["has_hallucination"])
    if not seen:
        raise ValueError("Empty human review file")
    return dict(M4=proportion(edit_free, len(seen)) | {"scope": "human checklist, reviewed drafts only; not pilot publication logs"},
                M5=proportion(hallucinations, len(seen)) | {"scope": "human semantic review; reviewed drafts only"},
                review_coverage=dict(reviewed=len(seen), available=len(index)))


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--results", required=True)
    p.add_argument("--output", required=True)
    args = p.parse_args()
    rows = [json.loads(x) for x in Path(args.results).read_text(encoding="utf-8").splitlines() if x.strip()]
    target = Path(args.output)
    if target.exists():
        raise SystemExit("Refusing to overwrite existing human review labels")
    target.parent.mkdir(parents=True, exist_ok=True)
    with target.open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=["id", "repeat", "platform", "output_sha256", "edit_free", "has_hallucination", "reviewer", "reason"])
        writer.writeheader()
        for key, content in draft_index(rows).items():
            writer.writerow(dict(id=key[0], repeat=key[1], platform=key[2], output_sha256=fingerprint(content)))
    print("Review worksheet created; blank cells are deliberately not fabricated")


if __name__ == "__main__":
    main()
