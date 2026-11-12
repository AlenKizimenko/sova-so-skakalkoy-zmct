"""Local lab dashboard. Run on loopback only: python -m ml.tracing.dashboard."""
import html
import json
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from ml.tracing import TRACE_PATH

app = FastAPI()


@app.get("/", response_class=HTMLResponse)
def index():
    rows = []
    if TRACE_PATH.exists():
        for line in TRACE_PATH.read_text(encoding="utf-8").splitlines()[-300:]:
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError:
                pass
    cards = []
    for row in reversed(rows):
        cards.append("<details><summary>" + html.escape(
            f"{row['stage']} · {row['status']} · {row['latency_ms']:.0f} ms · {row['trace_id'][:12]}")
            + "</summary><pre>" + html.escape(json.dumps(row, ensure_ascii=False, indent=2)) + "</pre></details>")
    return """<!doctype html><html lang=ru><meta charset=utf-8><title>Sova · LLM traces</title>
<style>body{max-width:1100px;margin:40px auto;background:#101824;color:#dae4ee;font:16px system-ui}
details{padding:16px;margin:8px 0;background:#1b293b;border-radius:10px}pre{white-space:pre-wrap;overflow-wrap:anywhere}</style>
<h1>Sova · LLM traces</h1><p>OpenTelemetry SDK · последние 300 вызовов · обновите страницу для новых данных</p>""" + (
        "".join(cards) or "<p>Трейсов пока нет. Запустите модель или тесты.</p>") + "</html>"


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
