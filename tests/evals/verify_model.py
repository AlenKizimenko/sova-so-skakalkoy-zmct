"""Fail closed when a mutable registry tag points at different weights."""
import json
import os
import urllib.request

EXPECTED = "357c53fb659c5076de1d65ccb0b397446227b71a42be9d1603d46168015c9e4b"


def main():
    base = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
    with urllib.request.urlopen(base + "/api/tags", timeout=10) as response:
        models = json.load(response)["models"]
    match = [m for m in models if m["name"] == "qwen2.5:3b"]
    if len(match) != 1 or match[0]["digest"] != EXPECTED:
        raise SystemExit("Model digest differs from Lab 3 baseline. Review a model migration explicitly.")
    print("Verified qwen2.5:3b digest: " + EXPECTED)


if __name__ == "__main__":
    main()
