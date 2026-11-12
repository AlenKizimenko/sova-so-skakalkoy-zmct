"""OpenTelemetry SDK spans, with a local JSONL exporter and no external account."""
import json
import os
import threading
from pathlib import Path
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor, SpanExporter, SpanExportResult
from opentelemetry.sdk.resources import Resource

TRACE_PATH = Path(os.getenv("AI_TRACE_PATH", "logs/llm-traces.jsonl"))
_lock = threading.Lock()


class JsonExporter(SpanExporter):
    def export(self, spans):
        TRACE_PATH.parent.mkdir(parents=True, exist_ok=True)
        with _lock, TRACE_PATH.open("a", encoding="utf-8") as stream:
            for span in spans:
                stream.write(json.dumps({"trace_id": format(span.context.trace_id, "032x"),
                    "span_id": format(span.context.span_id, "016x"), "stage": span.name,
                    "start_unix_ns": span.start_time,
                    "latency_ms": (span.end_time - span.start_time) / 1e6,
                    "attributes": dict(span.attributes), "status": span.status.status_code.name},
                    ensure_ascii=False) + "\n")
        return SpanExportResult.SUCCESS

    def shutdown(self):
        pass


provider = TracerProvider(resource=Resource.create({"service.name": "sova-ai-baseline"}))
provider.add_span_processor(SimpleSpanProcessor(JsonExporter()))
tracer = provider.get_tracer("sova.baseline", "lab3-v1")


def capture_content():
    # Explicit opt-in for synthetic lab data. Default matches Lab 2 privacy policy.
    return os.getenv("AI_TRACE_CONTENT", "false").lower() == "true"
