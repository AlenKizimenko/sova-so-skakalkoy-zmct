"""Live paired comparison. Run python -m ml.prompts_v2.ab from repository root."""
import argparse
import asyncio
import json
import os
import time
from pathlib import Path

from ml.dataset import load_dataset, model_input
from ml.experiment import run
from ml.models.baseline import Baseline
from ml.prompts_v2 import Candidate, ExtractionCache
from tests.evals.metrics import calculate


def dump(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def costs(rows):
    usages = [r.get("usage") or r.get("failed_attempt_usage") for r in rows]
    return {
        key: sum(u[key] for u in usages if u)
        for key in ("input_tokens", "output_tokens", "cost_rub", "attempts")
    } | {"unknown_usage": sum(u is None for u in usages)}


def eligible(old, new, *, strict):
    pairs = [("M2", -1), ("M3", 1), ("M6", -1), ("E3", 1), ("S1", 1)]
    deltas = [
        direction * (new[key]["value"] - old[key]["value"])
        for key, direction in pairs
        if old[key]["value"] is not None and new[key]["value"] is not None
    ]
    return all(d >= 0 for d in deltas) and (not strict or any(d > 0 for d in deltas))


async def compare(args):
    os.environ["LLM_PROVIDER"] = "ollama"
    os.environ["LLM_MODEL"] = "qwen2.5:3b"
    os.environ["AI_TRACE_CONTENT"] = "false"
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    factories = {"A_baseline": Baseline, "B_prompt": Candidate,
                 "C_calendar": lambda: Candidate(calendar=True),
                 "D_compact": lambda: Candidate(calendar=True, compact=True)}
    summary = {}
    for name, factory in factories.items():
        run_args = argparse.Namespace(**vars(args) | {"output": str(output / name), "generate": False})
        rows = await run(run_args, model_factory=factory, prompt_version=name)
        metrics = calculate(rows)
        dump(output / name / "metrics.json", metrics)
        summary[name] = {"metrics": metrics, "cost": costs(rows)}
    a, b, c, d = summary.values()
    comparisons = {
        "B_vs_A": eligible(a["metrics"], b["metrics"], strict=True),
        "C_vs_B": eligible(b["metrics"], c["metrics"], strict=True),
        "D_vs_C": eligible(c["metrics"], d["metrics"], strict=False)
                  and d["cost"]["input_tokens"] < c["cost"]["input_tokens"]
                  and not (c["cost"]["unknown_usage"] or d["cost"]["unknown_usage"]),
    }
    winner = "A_baseline"
    for name in ("B_prompt", "C_calendar", "D_compact"):
        candidate = summary[name]
        current = summary[winner]
        better = eligible(current["metrics"], candidate["metrics"], strict=True)
        cheaper = (name == "D_compact" and eligible(current["metrics"], candidate["metrics"], strict=False)
                   and candidate["cost"]["input_tokens"] < current["cost"]["input_tokens"]
                   and not (candidate["cost"]["unknown_usage"] or current["cost"]["unknown_usage"]))
        if better or cheaper:
            winner = name

    model = factories[winner]()
    cache = ExtractionCache(model)
    example = next(r for r in load_dataset(args.dataset) if args.split == "all" or r.get("split") == args.split)
    payload = model_input(example)
    replay = []
    try:
        for mode in ("uncached", "uncached", "cold", "hit"):
            started = time.perf_counter()
            result = (await model.extract(**payload) if mode == "uncached"
                      else await cache.extract(scope="offline-eval", **payload))
            replay.append({"mode": mode, "latency_ms": (time.perf_counter() - started) * 1000, **result})
    finally:
        await model.close()
    assert replay[-1]["event"] == replay[-2]["event"]
    dump(output / "cache.json", {"id": example["id"], "requests": replay})
    dump(output / "comparison.json", {"variants": summary, "decisions": comparisons, "selected": winner})


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dataset", default="docs/quality/golden-dataset/ci.jsonl")
    parser.add_argument("--split", choices=["dev", "test", "all"], default="dev")
    parser.add_argument("--limit", type=int)
    parser.add_argument("--repeats", type=int, choices=[1, 2, 3], default=1)
    parser.add_argument("--output", default="docs/experiments/lab4-run")
    args = parser.parse_args()
    asyncio.run(compare(args))


if __name__ == "__main__":
    main()
