import { readFile } from "node:fs/promises";
import path from "node:path";
import { defaultProfile, type UserProfile } from "@/lib/mock-data";

export type BoardTone = "ai" | "cloud" | "semis" | "index" | "risk";
export type SectorKey = Exclude<BoardTone, "risk">;
export type SentimentLabel = "偏多" | "中性" | "偏空";
export type SentimentTrend = "升温" | "分歧扩大" | "情绪修复" | "回落";
export type MarketSignalKind =
  | "情绪偏热"
  | "分歧扩大"
  | "情绪修复"
  | "情绪回落"
  | "情绪平稳";

export type StockSentimentSignal = {
  ticker: string;
  company: string;
  sectorKey: SectorKey;
  sectorName: string;
  label: SentimentLabel;
  score: number;
  intensity: number;
  trend: SentimentTrend;
  sampleSize: number;
  positiveShare: number;
  neutralShare: number;
  negativeShare: number;
  note?: string;
};

export type SectorSentimentSignal = {
  key: SectorKey;
  name: string;
  label: SentimentLabel;
  score: number;
  intensity: number;
  trend: SentimentTrend;
  sampleSize: number;
  leaders: string[];
  note?: string;
};

export type SentimentSnapshot = {
  generatedAt: string;
  sourceModel: string;
  stocks: StockSentimentSignal[];
  sectors: SectorSentimentSignal[];
};

export type SentimentProviderResult = {
  snapshot: SentimentSnapshot;
  source: "offline-bert" | "mock";
};

export type SentimentSummary = {
  focusStock?: StockSentimentSignal;
  focusSector?: SectorSentimentSignal;
  marketSignal: MarketSignalKind;
  summaryLabel: string;
};

const SNAPSHOT_FILE_PATH = path.join(
  process.cwd(),
  "bert",
  "exports",
  "stockpal-sentiment.snapshot.json",
);

const sectorNameMap: Record<SectorKey, string> = {
  ai: "AI 基建",
  cloud: "云软件",
  semis: "半导体",
  index: "大盘",
};

const tickerMetaMap: Record<
  string,
  {
    company: string;
    sectorKey: SectorKey;
    sectorName: string;
  }
> = {
  AAPL: { company: "Apple", sectorKey: "ai", sectorName: sectorNameMap.ai },
  AMD: { company: "AMD", sectorKey: "semis", sectorName: sectorNameMap.semis },
  DIA: { company: "Dow ETF", sectorKey: "index", sectorName: sectorNameMap.index },
  META: { company: "Meta", sectorKey: "ai", sectorName: sectorNameMap.ai },
  MSFT: { company: "Microsoft", sectorKey: "cloud", sectorName: sectorNameMap.cloud },
  NVDA: { company: "NVIDIA", sectorKey: "semis", sectorName: sectorNameMap.semis },
  QQQ: { company: "Nasdaq ETF", sectorKey: "index", sectorName: sectorNameMap.index },
  SPY: { company: "S&P 500 ETF", sectorKey: "index", sectorName: sectorNameMap.index },
  TSLA: { company: "Tesla", sectorKey: "ai", sectorName: sectorNameMap.ai },
};

const trendPriority: Record<SentimentTrend, number> = {
  "分歧扩大": 4,
  "升温": 3,
  "情绪修复": 2,
  "回落": 1,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function inferSectorKey(value?: string | null): SectorKey {
  if (!value) {
    return "index";
  }

  if (value.includes("AI")) {
    return "ai";
  }

  if (value.includes("云")) {
    return "cloud";
  }

  if (value.includes("半导体")) {
    return "semis";
  }

  return "index";
}

function normalizeLabel(value: unknown, fallback: SentimentLabel = "中性"): SentimentLabel {
  if (value === "偏多" || value === "中性" || value === "偏空") {
    return value;
  }

  return fallback;
}

function normalizeTrend(
  value: unknown,
  fallback: SentimentTrend = "情绪修复",
): SentimentTrend {
  if (value === "升温" || value === "分歧扩大" || value === "情绪修复" || value === "回落") {
    return value;
  }

  return fallback;
}

function toRatio(value: unknown, fallback: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }

  return clamp(Number(value.toFixed(3)), 0, 1);
}

function toInt(value: unknown, fallback: number, min: number, max: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }

  return clamp(Math.round(value), min, max);
}

function toTickerMeta(ticker: string, sectorName?: string, sectorKey?: SectorKey) {
  const base = tickerMetaMap[ticker];

  if (base) {
    return {
      company: base.company,
      sectorKey: sectorKey ?? base.sectorKey,
      sectorName: sectorName ?? base.sectorName,
    };
  }

  const inferredSectorKey = sectorKey ?? inferSectorKey(sectorName);

  return {
    company: ticker,
    sectorKey: inferredSectorKey,
    sectorName: sectorName ?? sectorNameMap[inferredSectorKey],
  };
}

function scoreToLabel(score: number): SentimentLabel {
  if (score >= 35) {
    return "偏多";
  }

  if (score <= -20) {
    return "偏空";
  }

  return "中性";
}

function trendFromScore(score: number, intensity: number): SentimentTrend {
  if (score >= 55 && intensity >= 75) {
    return "升温";
  }

  if (score >= 65 && intensity >= 85) {
    return "分歧扩大";
  }

  if (score <= -18) {
    return "回落";
  }

  return "情绪修复";
}

function normalizeStockSignal(input: unknown): StockSentimentSignal | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const raw = input as Record<string, unknown>;
  const ticker = typeof raw.ticker === "string" ? raw.ticker.toUpperCase() : "";

  if (!ticker) {
    return null;
  }

  const normalizedSectorKey =
    raw.sectorKey === "ai" ||
    raw.sectorKey === "cloud" ||
    raw.sectorKey === "semis" ||
    raw.sectorKey === "index"
      ? raw.sectorKey
      : inferSectorKey(typeof raw.sectorName === "string" ? raw.sectorName : undefined);
  const meta = toTickerMeta(
    ticker,
    typeof raw.sectorName === "string" ? raw.sectorName : undefined,
    normalizedSectorKey,
  );
  const score = toInt(raw.score, 0, -100, 100);
  const intensity = toInt(raw.intensity, Math.abs(score), 0, 100);

  return {
    ticker,
    company: typeof raw.company === "string" ? raw.company : meta.company,
    sectorKey: meta.sectorKey,
    sectorName: meta.sectorName,
    label: normalizeLabel(raw.label, scoreToLabel(score)),
    score,
    intensity,
    trend: normalizeTrend(raw.trend, trendFromScore(score, intensity)),
    sampleSize: toInt(raw.sampleSize, 0, 0, 999999),
    positiveShare: toRatio(raw.positiveShare, 0.34),
    neutralShare: toRatio(raw.neutralShare, 0.36),
    negativeShare: toRatio(raw.negativeShare, 0.3),
    note: typeof raw.note === "string" ? raw.note : undefined,
  };
}

function normalizeSectorSignal(input: unknown): SectorSentimentSignal | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const raw = input as Record<string, unknown>;
  const key =
    raw.key === "ai" || raw.key === "cloud" || raw.key === "semis" || raw.key === "index"
      ? raw.key
      : inferSectorKey(typeof raw.name === "string" ? raw.name : undefined);
  const score = toInt(raw.score, 0, -100, 100);
  const intensity = toInt(raw.intensity, Math.abs(score), 0, 100);

  return {
    key,
    name: typeof raw.name === "string" ? raw.name : sectorNameMap[key],
    label: normalizeLabel(raw.label, scoreToLabel(score)),
    score,
    intensity,
    trend: normalizeTrend(raw.trend, trendFromScore(score, intensity)),
    sampleSize: toInt(raw.sampleSize, 0, 0, 999999),
    leaders: Array.isArray(raw.leaders)
      ? raw.leaders.filter((item): item is string => typeof item === "string")
      : [],
    note: typeof raw.note === "string" ? raw.note : undefined,
  };
}

function dedupeByKey<T>(items: T[], getKey: (item: T) => string) {
  const map = new Map<string, T>();

  for (const item of items) {
    map.set(getKey(item), item);
  }

  return [...map.values()];
}

function buildMockStockSignal(
  ticker: string,
  sectorName?: string,
  fallbackIndex = 0,
): StockSentimentSignal {
  const meta = toTickerMeta(ticker.toUpperCase(), sectorName);
  const presets = [
    { score: 58, intensity: 68, trend: "升温" as const, note: "讨论热度升温，偏多情绪占优。" },
    { score: 18, intensity: 46, trend: "情绪修复" as const, note: "观点仍偏谨慎，但悲观情绪在缓和。" },
    { score: 74, intensity: 84, trend: "分歧扩大" as const, note: "高热讨论延续，但分歧也在同步放大。" },
    { score: -12, intensity: 34, trend: "回落" as const, note: "指数情绪略偏保守，风险偏好有回落迹象。" },
  ];
  const preset = presets[fallbackIndex % presets.length];

  return {
    ticker: ticker.toUpperCase(),
    company: meta.company,
    sectorKey: meta.sectorKey,
    sectorName: meta.sectorName,
    label: scoreToLabel(preset.score),
    score: preset.score,
    intensity: preset.intensity,
    trend: preset.trend,
    sampleSize: 120 + fallbackIndex * 16,
    positiveShare: preset.score > 0 ? 0.52 : 0.28,
    neutralShare: 0.31,
    negativeShare: preset.score > 0 ? 0.17 : 0.41,
    note: preset.note,
  };
}

function pickDominantTrend(items: Array<{ trend: SentimentTrend }>): SentimentTrend {
  const bucket = new Map<SentimentTrend, number>();

  for (const item of items) {
    bucket.set(item.trend, (bucket.get(item.trend) ?? 0) + trendPriority[item.trend]);
  }

  return (
    [...bucket.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ??
    "情绪修复"
  );
}

function aggregateSectorSignals(stocks: StockSentimentSignal[]): SectorSentimentSignal[] {
  const grouped = new Map<SectorKey, StockSentimentSignal[]>();

  for (const stock of stocks) {
    const list = grouped.get(stock.sectorKey) ?? [];
    list.push(stock);
    grouped.set(stock.sectorKey, list);
  }

  return [...grouped.entries()].map(([key, items]) => {
    const score = Math.round(items.reduce((sum, item) => sum + item.score, 0) / items.length);
    const intensity = Math.round(
      items.reduce((sum, item) => sum + item.intensity, 0) / items.length,
    );
    const sampleSize = items.reduce((sum, item) => sum + item.sampleSize, 0);
    const leaders = [...items]
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, 2)
      .map((item) => item.ticker);

    return {
      key,
      name: items[0]?.sectorName ?? sectorNameMap[key],
      label: scoreToLabel(score),
      score,
      intensity,
      trend: pickDominantTrend(items),
      sampleSize,
      leaders,
      note: `${items.length} 只标的离线情绪聚合结果。`,
    };
  });
}

function buildMockSnapshot(profile: UserProfile = defaultProfile): SentimentSnapshot {
  const baseTickers = dedupeByKey(
    [...profile.holdings, "QQQ", "SPY", "DIA"],
    (item) => item.toUpperCase(),
  );
  const stocks = baseTickers.map((ticker, index) =>
    buildMockStockSignal(
      ticker,
      index < profile.sectors.length ? profile.sectors[index] : undefined,
      index,
    ),
  );

  return {
    generatedAt: new Date().toISOString(),
    sourceModel: "mock-sentiment-fallback",
    stocks,
    sectors: aggregateSectorSignals(stocks),
  };
}

function normalizeSnapshot(
  snapshot: SentimentSnapshot,
  profile: UserProfile = defaultProfile,
): SentimentSnapshot {
  const stockMap = new Map(snapshot.stocks.map((item) => [item.ticker, item]));
  const baseMock = buildMockSnapshot(profile);

  for (const fallback of baseMock.stocks) {
    if (!stockMap.has(fallback.ticker)) {
      stockMap.set(fallback.ticker, fallback);
    }
  }

  const stocks = dedupeByKey([...stockMap.values()], (item) => item.ticker);
  const normalizedSectorMap = new Map(
    aggregateSectorSignals(stocks).map((item) => [item.key, item]),
  );

  for (const sector of snapshot.sectors) {
    normalizedSectorMap.set(sector.key, sector);
  }

  return {
    generatedAt: snapshot.generatedAt,
    sourceModel: snapshot.sourceModel,
    stocks,
    sectors: [...normalizedSectorMap.values()],
  };
}

function parseSnapshot(content: string, profile: UserProfile): SentimentSnapshot | null {
  const raw = JSON.parse(content) as Record<string, unknown>;
  const stocks = Array.isArray(raw.stocks)
    ? raw.stocks
        .map((item) => normalizeStockSignal(item))
        .filter((item): item is StockSentimentSignal => item !== null)
    : [];
  const sectors = Array.isArray(raw.sectors)
    ? raw.sectors
        .map((item) => normalizeSectorSignal(item))
        .filter((item): item is SectorSentimentSignal => item !== null)
    : [];

  if (stocks.length === 0) {
    return null;
  }

  return normalizeSnapshot(
    {
      generatedAt:
        typeof raw.generatedAt === "string" ? raw.generatedAt : new Date().toISOString(),
      sourceModel:
        typeof raw.sourceModel === "string" ? raw.sourceModel : "offline-bert-export",
      stocks,
      sectors,
    },
    profile,
  );
}

export async function getSentimentProviderResult(
  profile: UserProfile = defaultProfile,
): Promise<SentimentProviderResult> {
  try {
    const content = await readFile(SNAPSHOT_FILE_PATH, "utf-8");
    const parsed = parseSnapshot(content, profile);

    if (parsed) {
      return {
        snapshot: parsed,
        source: "offline-bert",
      };
    }
  } catch {
    // Falls back to mock signals when the offline export is not present.
  }

  return {
    snapshot: buildMockSnapshot(profile),
    source: "mock",
  };
}

export function getStockSentimentSignal(
  snapshot: SentimentSnapshot | null | undefined,
  ticker: string,
) {
  return snapshot?.stocks.find((item) => item.ticker === ticker.toUpperCase());
}

export function getSectorSentimentSignal(
  snapshot: SentimentSnapshot | null | undefined,
  value: SectorKey | string | undefined,
) {
  if (!snapshot || !value) {
    return undefined;
  }

  const key =
    value === "ai" || value === "cloud" || value === "semis" || value === "index"
      ? value
      : inferSectorKey(value);

  return snapshot.sectors.find((item) => item.key === key || item.name === value);
}

export function buildSentimentSummary({
  snapshot,
  profile = defaultProfile,
  focusTicker,
  sectorKey,
}: {
  snapshot: SentimentSnapshot;
  profile?: UserProfile;
  focusTicker?: string;
  sectorKey?: SectorKey;
}): SentimentSummary {
  const focusStock = focusTicker
    ? getStockSentimentSignal(snapshot, focusTicker)
    : getStockSentimentSignal(snapshot, profile.holdings[0] ?? "");
  const resolvedSectorKey =
    sectorKey ??
    focusStock?.sectorKey ??
    inferSectorKey(profile.sectors[0] ?? undefined);
  const focusSector = getSectorSentimentSignal(snapshot, resolvedSectorKey);
  const marketSignal = resolveMarketSignal(focusStock, focusSector);

  return {
    focusStock,
    focusSector,
    marketSignal,
    summaryLabel: focusStock
      ? `${focusStock.ticker} ${focusStock.label}`
      : focusSector
        ? `${focusSector.name} ${focusSector.label}`
        : "情绪中性",
  };
}

export function resolveMarketSignal(
  focusStock?: StockSentimentSignal,
  focusSector?: SectorSentimentSignal,
): MarketSignalKind {
  if (focusStock?.trend === "分歧扩大" || focusSector?.trend === "分歧扩大") {
    return "分歧扩大";
  }

  if (
    (focusStock?.label === "偏多" && focusStock.intensity >= 78) ||
    (focusSector?.label === "偏多" && focusSector.intensity >= 78)
  ) {
    return "情绪偏热";
  }

  if (focusStock?.trend === "回落" || focusSector?.trend === "回落") {
    return "情绪回落";
  }

  if (focusStock?.trend === "情绪修复" || focusSector?.trend === "情绪修复") {
    return "情绪修复";
  }

  return "情绪平稳";
}

