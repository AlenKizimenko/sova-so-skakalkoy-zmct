import json
import ml.tracing as tracing
from ml.tracing.dashboard import index


def test_sdk_trace_relationship_and_dashboard_escapes_content(tmp_path, monkeypatch):
    path = tmp_path / "traces.jsonl"
    monkeypatch.setattr(tracing, "TRACE_PATH", path)
    import ml.tracing.dashboard as dashboard
    monkeypatch.setattr(dashboard, "TRACE_PATH", path)
    with tracing.tracer.start_as_current_span("request"):
        with tracing.tracer.start_as_current_span("extract") as span:
            span.set_attribute("prompt", "<script>alert('x')</script>")
            span.set_attribute("response", '{"title":null}')
    rows = [json.loads(x) for x in path.read_text(encoding="utf-8").splitlines()]
    assert len(rows) == 2
    assert rows[0]["trace_id"] == rows[1]["trace_id"]
    html = index()
    assert "<script>" not in html
    assert "&lt;script&gt;" in html
    assert "response" in html
