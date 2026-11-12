"""One reproducible live baseline command; writes every request to JSONL + CSV."""
import argparse
import asyncio
import csv
import hashlib
import json
import os
import subprocess
import time
import httpx
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()
from ml.dataset import load_dataset, expected_projection, model_input
from ml.models.baseline import Baseline, ModelError, merge_usage
from ml.tracing import tracer


async def run(args):
    out = Path(args.output)
    out.mkdir(parents=True, exist_ok=True)
    source = Path(args.dataset)
    rows = load_dataset(source)
    if args.split != "all":
        rows = [row for row in rows if row.get("split") == args.split]
    if args.limit:
        rows = rows[:args.limit]
    if not rows:
        raise ValueError("empty dataset selection")
    model = Baseline()
    runtime = {}
    if model.provider == "ollama":
        async with httpx.AsyncClient(base_url=os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")) as http:
            runtime["version"] = (await http.get("/api/version")).json()
            runtime["models"] = (await http.get("/api/tags")).json()
    results = []
    try:
        with (out / "requests.jsonl").open("w", encoding="utf-8") as stream:
            for row in rows:
                for repeat in range(args.repeats):
                    started = time.perf_counter()
                    expected, fields = expected_projection(row)
                    result = dict(id=row["id"], repeat=repeat, expected=expected, assert_fields=fields,
                        tags=row.get("tags", []), split=row.get("split"), attack=row.get("attack"),
                        status="error", usage_complete=False, model=model.model, prompt_version="lab3-v1")
                    with tracer.start_as_current_span("experiment-request"):
                        try:
                            extraction = await model.extract(**model_input(row))
                            result.update(status="ok", usage_complete=True, **extraction)
                            result["extraction_latency_ms"] = (time.perf_counter() - started) * 1000
                            # Generate drafts for every successful extraction, including incomplete
                            # cards: an explicit offline experiment, never the confirmed-only API.
                            if args.generate:
                                generation = await model.generate(extraction["event"], ["vk", "email", "site"])
                                result["generation"] = generation
                                result["usage"] = merge_usage([extraction["usage"], generation["usage"]])
                        except ModelError as exc:
                            result.update(status="error", usage_complete=False, error_code=exc.code,
                                          failed_attempt_usage=exc.usage)
                        result["latency_ms"] = (time.perf_counter() - started) * 1000
                    stream.write(json.dumps(result, ensure_ascii=False) + "\n")
                    stream.flush()
                    results.append(result)
                    print(f"{row['id']} repeat={repeat + 1} {result['status']} {result['latency_ms']:.0f}ms", flush=True)
    finally:
        await model.close()
    with (out / "usage.csv").open("w", newline="", encoding="utf-8") as stream:
        fields = ["id", "repeat", "status", "usage_complete", "latency_ms", "input_tokens", "output_tokens", "cost_rub", "attempts"]
        writer = csv.DictWriter(stream, fieldnames=fields)
        writer.writeheader()
        for r in results:
            usage = r.get("usage", r.get("failed_attempt_usage"))
            writer.writerow({k: r.get(k, (usage or {}).get(k)) for k in fields})
    metadata = dict(dataset=str(source), dataset_sha256=hashlib.sha256(source.read_bytes()).hexdigest(),
        model=model.model, provider=model.provider, repeats=args.repeats, split=args.split,
        generate=args.generate, records=len(results), prompt_version="lab3-v1", rag=False,
        search_metrics=None, search_reason="No retrieval in the pipeline",
        timestamp=datetime.now(timezone.utc).isoformat(),
        revision=subprocess.check_output(["git", "-c", f"safe.directory={Path.cwd().resolve().as_posix()}", "rev-parse", "HEAD"], text=True).strip(),
        timeout_seconds=model.timeout, deadline_seconds=model.deadline, runtime=runtime,
        working_tree_dirty=bool(subprocess.check_output(["git", "-c", f"safe.directory={Path.cwd().resolve().as_posix()}", "status", "--porcelain"], text=True).strip()),
        baseline_source_sha256=hashlib.sha256(Path("ml/models/baseline.py").read_bytes()).hexdigest())
    (out / "run.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8")
    return results


def parser():
    p = argparse.ArgumentParser()
    p.add_argument("--dataset", default="docs/golden-dataset/v1.jsonl")
    p.add_argument("--output", default="docs/experiments/lab3-run")
    p.add_argument("--split", choices=["dev", "test", "all"], default="dev")
    p.add_argument("--repeats", type=int, choices=[1, 2, 3], default=3)
    p.add_argument("--limit", type=int)
    p.add_argument("--generate", action="store_true")
    return p


if __name__ == "__main__":
    asyncio.run(run(parser().parse_args()))
