import csv
import pytest
from tests.evals.review import fingerprint, score_reviews


def review_file(tmp_path, **overrides):
    content = dict(platform="vk", headline="Test", snippet="Test", body="Test")
    rows = [dict(id="case", repeat=0, generation=dict(contents=[content]))]
    review = dict(id="case", repeat="0", platform="vk", output_sha256=fingerprint(content),
                  edit_free="1", has_hallucination="0", reviewer="human-test-fixture", reason="fixture") | overrides
    path = tmp_path / "reviews.csv"
    with path.open("w", newline="", encoding="utf-8") as stream:
        writer=csv.DictWriter(stream, fieldnames=list(review))
        writer.writeheader()
        writer.writerow(review)
    return rows, path


def test_human_scores_are_scoped_to_reviewed_drafts(tmp_path):
    rows,path=review_file(tmp_path)
    metrics=score_reviews(rows,path)
    assert metrics["M4"]["value"] == 1
    assert metrics["M5"]["value"] == 0
    assert metrics["review_coverage"] == dict(reviewed=1,available=1)


@pytest.mark.parametrize("override", [dict(edit_free=""),dict(output_sha256="wrong"),dict(reviewer="")])
def test_incomplete_or_stale_labels_do_not_become_metrics(tmp_path, override):
    rows,path=review_file(tmp_path, **override)
    with pytest.raises(ValueError):
        score_reviews(rows,path)
