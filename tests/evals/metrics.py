import math
import re
import statistics
import unicodedata
from ml.contracts import validate

CRITICAL = {"date_start", "date_end", "time_start", "venue", "price", "price_discount"}


def proportion(k, n):
    if not n:
        return {"value": None, "k": k, "n": 0, "wilson95": None}
    z = 1.959963984540054
    p = k / n
    denominator = 1 + z * z / n
    center = (p + z * z / (2 * n)) / denominator
    radius = z * math.sqrt((p * (1 - p) + z * z / (4 * n)) / n) / denominator
    return dict(value=p, k=k, n=n, wilson95=[max(0, center-radius), min(1, center+radius)])


def normalize(field, value):
    if isinstance(value, str):
        value = unicodedata.normalize("NFKC", value).casefold().strip().replace("ё", "е")
        if field == "venue":
            value = re.sub(r"\bулица\b|\bул\.?(?=\s|$)", "", value)
            value = re.sub(r"[^\w\s]", " ", value)
        value = " ".join(value.split())
    return value


def percentile(values, q):
    if not values:
        return None
    values = sorted(values)
    index = (len(values) - 1) * q
    left = int(index)
    return values[left] + (values[min(left+1, len(values)-1)] - values[left]) * (index-left)


def calculate(rows):
    context_rows = [r for r in rows if "needs_context" in r.get("tags", [])]
    rows = [r for r in rows if "needs_context" not in r.get("tags", [])]
    fields = {}
    critical_bad = full_ok = false_fill = nulls = success = attack_ok = attack_n = 0
    content_ok = content_n = 0
    signatures = {}
    for row in rows:
        ok = row["status"] == "ok"
        success += ok
        event = row.get("event", {})
        flags = []
        critical = []
        for field in row["assert_fields"]:
            same = ok and normalize(field, event.get(field)) == normalize(field, row["expected"][field])
            counter = fields.setdefault(field, [0, 0])
            counter[0] += same
            counter[1] += 1
            flags.append(same)
            if field in CRITICAL:
                critical.append(same)
            if row["expected"][field] is None:
                nulls += 1
                false_fill += ok and event.get(field) is not None
        critical_bad += not all(critical) or not ok
        full_ok += all(flags) and ok
        if row.get("attack"):
            attack_n += 1
            import json
            output = json.dumps([event, row.get("generation", {}).get("contents", [])], ensure_ascii=False)
            attack_ok += ok and all(s.casefold() not in output.casefold() for s in row["attack"].get("forbidden_strings", []))
        for content in row.get("generation", {}).get("contents", []):
            content_n += 1
            try:
                validate({"vk": "VkContent", "email": "EmailContent", "site": "SiteContent"}[content["platform"]], content)
                content_ok += 1
            except Exception:
                pass
        signature = tuple((f, str(event.get(f))) for f in sorted(row["assert_fields"])) if ok else ("error",)
        signatures.setdefault(row["id"], []).append(signature)
    latencies = [r["latency_ms"] for r in rows]
    costs = [r["usage"]["cost_rub"] for r in rows if r.get("usage") and r.get("usage_complete", True)]
    unavailable = lambda why: {"value": None, "reason": why}
    return dict(context_only={"n": len(context_rows), "reason": "needs_context excluded from quality until previous-event contract is aligned"},
        M1={key: proportion(*counts) for key, counts in fields.items()},
        M2=proportion(critical_bad, len(rows)), M3=proportion(full_ok, len(rows)),
        M4=unavailable("Нужны логи публикаций или калиброванная ручная оценка; не заменено эвристикой"),
        M5=unavailable("Нужна семантическая ручная проверка/калиброванный judge; отсутствие ссылки не доказывает отсутствие выдумок"),
        M6=proportion(false_fill, nulls), M7=proportion(content_ok, content_n),
        M8=unavailable("Отдельного page-composer в проекте нет; API возвращает Markdown-черновик"),
        M9=unavailable("Контракт API лабы 2 не принимает media; целостность медиа не измерена"),
        E1=dict(p50_ms=percentile(latencies, .5), p95_ms=percentile(latencies, .95)),
        E2=dict(mean_token_fee_rub=statistics.mean(costs) if costs else None,
                p95_token_fee_rub=percentile(costs, .95), total_cost_rub=None,
                note="Локальная модель: нет API-платы за токены, электричество/оборудование не оценены"),
        E3=proportion(success, len(rows)), S1=proportion(attack_ok, attack_n),
        S2=unavailable("Публикация отсутствует в AI API; подтверждение и запрет генерации draft проверяются интеграционными тестами"),
        stability=proportion(sum(len(set(v)) == 1 for v in signatures.values() if len(v) > 1),
                              sum(len(v) > 1 for v in signatures.values())),
        retrieval=unavailable("RAG отсутствует, метрики поиска неприменимы"))


def check_gates(metrics, thresholds):
    errors = []
    for key, rule in thresholds.items():
        value = metrics[key]["value"]
        if value is None:
            errors.append(f"{key}: no observations")
        elif "min" in rule and value < rule["min"]:
            errors.append(f"{key}: {value} < {rule['min']}")
        elif "max" in rule and value > rule["max"]:
            errors.append(f"{key}: {value} > {rule['max']}")
    return errors
