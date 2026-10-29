"""python -m tests.evals.run --dataset ... --output ... [--gate ...]."""
import asyncio
import json
from pathlib import Path
from ml.experiment import parser, run
from tests.evals.metrics import calculate, check_gates


def main():
    p = parser()
    p.add_argument("--gate", help="Versioned explicit thresholds JSON; absence means report only")
    p.add_argument("--from-results", help="Recalculate metrics from an existing live requests.jsonl, no model call")
    args = p.parse_args()
    if args.from_results:
        rows = [json.loads(x) for x in Path(args.from_results).read_text(encoding="utf-8").splitlines() if x.strip()]
    else:
        rows = asyncio.run(run(args))
    if not rows:
        raise SystemExit("No eval observations")
    metrics = calculate(rows)
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    errors = check_gates(metrics, json.loads(Path(args.gate).read_text(encoding="utf-8"))) if args.gate else []
    report = dict(tool="pytest + project deterministic scorers", scope="Lab2 public Event projection; see dataset migration README",
                  metrics=metrics, gate_errors=errors, gate=args.gate)
    (output / "metrics.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    raise SystemExit(1 if errors else 0)


if __name__ == "__main__":
    main()
