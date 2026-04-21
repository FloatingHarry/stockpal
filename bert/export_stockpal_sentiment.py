from __future__ import annotations

import argparse
import csv
import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


SENTIMENT_TO_LABEL = {
    "positive": "偏多",
    "neutral": "中性",
    "negative": "偏空",
}

SECTOR_NAME_MAP = {
    "ai": "AI 基建",
    "cloud": "云软件",
    "semis": "半导体",
    "index": "大盘",
}

TREND_PRIORITY = {
    "分歧扩大": 4,
    "升温": 3,
    "情绪修复": 2,
    "回落": 1,
}


def clamp(value: int, min_value: int, max_value: int) -> int:
    return max(min_value, min(value, max_value))


def load_manifest(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def load_rows(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        return [row for row in reader if row.get("sentiment")]


def score_to_label(score: int) -> str:
    if score >= 35:
        return "偏多"
    if score <= -20:
        return "偏空"
    return "中性"


def infer_trend(score: int, intensity: int) -> str:
    if score >= 65 and intensity >= 85:
        return "分歧扩大"
    if score >= 45:
        return "升温"
    if score <= -20:
        return "回落"
    return "情绪修复"


def ratio(value: int, total: int) -> float:
    if total <= 0:
        return 0.0
    return round(value / total, 3)


def aggregate_stock_signal(spec: dict[str, Any], base_dir: Path) -> dict[str, Any]:
    input_path = base_dir / spec["input"]
    rows = load_rows(input_path)
    counts = Counter(row["sentiment"].strip().lower() for row in rows)
    total = sum(counts.values())
    positive = counts["positive"]
    neutral = counts["neutral"]
    negative = counts["negative"]
    score = clamp(round(((positive - negative) / max(total, 1)) * 100), -100, 100)
    intensity = clamp(round(((positive + negative) / max(total, 1)) * 100), 0, 100)
    trend = infer_trend(score, intensity)
    sector_key = spec.get("sectorKey", "index")
    sector_name = spec.get("sectorName", SECTOR_NAME_MAP.get(sector_key, "大盘"))

    return {
        "ticker": str(spec["ticker"]).upper(),
        "company": spec.get("company") or str(spec["ticker"]).upper(),
        "sectorKey": sector_key,
        "sectorName": sector_name,
        "label": score_to_label(score),
        "score": score,
        "intensity": intensity,
        "trend": trend,
        "sampleSize": total,
        "positiveShare": ratio(positive, total),
        "neutralShare": ratio(neutral, total),
        "negativeShare": ratio(negative, total),
        "note": f"BERT 离线聚合，输入样本 {total} 条。",
    }


def dominant_trend(values: list[str]) -> str:
    bucket: dict[str, int] = defaultdict(int)
    for value in values:
        bucket[value] += TREND_PRIORITY.get(value, 0)
    return max(bucket.items(), key=lambda item: item[1])[0] if bucket else "情绪修复"


def aggregate_sector_signals(stocks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for stock in stocks:
        grouped[stock["sectorKey"]].append(stock)

    sector_signals: list[dict[str, Any]] = []
    for sector_key, items in grouped.items():
        score = round(sum(item["score"] for item in items) / len(items))
        intensity = round(sum(item["intensity"] for item in items) / len(items))
        sample_size = sum(item["sampleSize"] for item in items)
        leaders = [
            item["ticker"]
            for item in sorted(items, key=lambda value: value["intensity"], reverse=True)[:2]
        ]
        sector_signals.append(
            {
                "key": sector_key,
                "name": items[0].get("sectorName", SECTOR_NAME_MAP.get(sector_key, "大盘")),
                "label": score_to_label(score),
                "score": score,
                "intensity": intensity,
                "trend": dominant_trend([item["trend"] for item in items]),
                "sampleSize": sample_size,
                "leaders": leaders,
                "note": f"由 {len(items)} 只标的离线聚合得到。",
            }
        )

    return sector_signals


def build_snapshot(manifest: dict[str, Any], base_dir: Path) -> dict[str, Any]:
    items = manifest.get("items", [])
    if not isinstance(items, list) or not items:
        raise ValueError("Manifest must contain a non-empty 'items' list.")

    stocks = [aggregate_stock_signal(item, base_dir) for item in items]
    sectors = aggregate_sector_signals(stocks)

    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sourceModel": manifest.get("sourceModel", "fine-tuned chinese bert"),
        "stocks": stocks,
        "sectors": sectors,
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Export offline BERT sentiment results into a StockPal snapshot JSON."
    )
    parser.add_argument(
        "--config",
        default="stockpal_export_config.example.json",
        help="Path to the StockPal export manifest, relative to the bert/ directory.",
    )
    parser.add_argument(
        "--output",
        default="exports/stockpal-sentiment.generated.json",
        help="Output JSON path, relative to the bert/ directory.",
    )
    args = parser.parse_args()

    base_dir = Path(__file__).resolve().parent
    manifest_path = base_dir / args.config
    output_path = base_dir / args.output
    output_path.parent.mkdir(parents=True, exist_ok=True)

    manifest = load_manifest(manifest_path)
    snapshot = build_snapshot(manifest, base_dir)
    output_path.write_text(
        json.dumps(snapshot, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Wrote StockPal sentiment snapshot to {output_path}")


if __name__ == "__main__":
    main()
