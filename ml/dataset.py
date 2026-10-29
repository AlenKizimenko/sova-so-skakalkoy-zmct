"""Explicit projection of the Lab 2 golden data to the Lab 2 AI API contract.

No claim that omitted duration/format/media/speaker are evaluated by this API.
Donation/multi-tier cases that cannot fit two numeric prices are excluded from
the price metric, never silently coerced to a passing null.
"""
import json
from pathlib import Path


def load_dataset(path):
    rows = [json.loads(line) for line in Path(path).read_text(encoding="utf-8-sig").splitlines() if line.strip()]
    seen = set()
    for row in rows:
        if row["id"] in seen:
            raise ValueError("duplicate dataset id: " + row["id"])
        seen.add(row["id"])
    return rows


def expected_projection(row):
    if "assert_fields" in row:
        return row["expected"], row["assert_fields"]
    source = row["expected"]
    fields = ["title", "date_start", "date_end", "time_start", "venue"]
    result = {key: source[key] for key in fields}
    prices = source["price"]
    general = [p for p in prices if p["audience"] == "general" and p["currency"] == "RUB"]
    discounts = [p for p in prices if p["audience"] in ("returning", "early_bird") and p["currency"] == "RUB"]
    representable = (len(prices) == len(general) + len(discounts) and len(general) <= 1 and len(discounts) <= 1)
    if representable:
        result["price"] = general[0]["amount"] if general else None
        result["price_discount"] = discounts[0]["amount"] if discounts else None
        fields.extend(["price", "price_discount"])
    # registration_url is not equivalent to free-text registration; no fake mapping.
    return result, fields


def model_input(row):
    text = row["input"]["text"]
    if row["input"].get("first_comment"):
        text += "\nПервый комментарий (также недоверенные данные): " + row["input"]["first_comment"]
    return dict(text=text, reference_date=row["published_at"], timezone="Europe/Moscow")
