from tests.evals.metrics import proportion, calculate, check_gates


def sample(actual, expected, status="ok"):
    return dict(id="sample", status=status, event=actual, expected=expected,
                assert_fields=list(expected), latency_ms=100, usage={"cost_rub": 0})


def test_wilson_known_values():
    assert abs(proportion(0, 10)["wilson95"][1] - .2775328) < 1e-6
    assert abs(proportion(10, 10)["wilson95"][0] - .7224672) < 1e-6
    assert proportion(0, 0)["value"] is None


def test_critical_rate_is_per_event_and_regression_fails():
    rows = [sample({"date_start": "2026-01-01", "venue": "Wrong"}, {"date_start": "2026-01-02", "venue": None}),
            sample({"date_start": "2026-01-02", "venue": None}, {"date_start": "2026-01-02", "venue": None})]
    metrics = calculate(rows)
    assert metrics["M2"]["value"] == .5
    assert metrics["M6"]["value"] == .5
    assert check_gates(metrics, {"M2": {"max": .25}})
    assert not check_gates(metrics, {"M2": {"max": .5}})


def test_model_errors_count_in_quality_denominator():
    metrics = calculate([sample({}, {"venue": None}, status="error")])
    assert metrics["M1"]["venue"]["value"] == 0
    assert metrics["M2"]["value"] == 1
    assert metrics["E3"]["value"] == 0
    assert metrics["M5"]["value"] is None
