import { getDemoPortfolioSnapshot } from "@/lib/demo-content";
import { defaultProfile, type BoardTone, type PortfolioSnapshot, type UserProfile } from "@/lib/mock-data";
import type { NormalizedNewsItem } from "@/lib/news-normalizer";
import { getLeadNews } from "@/lib/news-ranker";
import { getQuoteProviderResult } from "@/lib/quote-provider";
import {
  buildSentimentSummary,
  getSectorSentimentSignal,
  getSentimentProviderResult,
  getStockSentimentSignal,
  type SentimentSnapshot,
} from "@/lib/sentiment-provider";

export type MarketSnapshotResult = {
  portfolio: PortfolioSnapshot;
  source: "mock";
  quoteSource: "mock";
  sentimentSource: "offline-bert" | "mock";
  sentimentSnapshot: SentimentSnapshot;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function inferBoardTone(value: string): BoardTone {
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

function aggregateBoardHeat(items: NormalizedNewsItem[]) {
  const base = {
    ai: 42,
    cloud: 42,
    semis: 42,
    index: 40,
  };

  for (const item of items) {
    const bump = Math.round(item.importance / 6);

    if (item.boardTone === "ai") {
      base.ai += bump;
    } else if (item.boardTone === "cloud") {
      base.cloud += bump;
    } else if (item.boardTone === "semis") {
      base.semis += bump;
    } else {
      base.index += bump;
    }
  }

  return {
    ai: Math.min(base.ai, 96),
    cloud: Math.min(base.cloud, 96),
    semis: Math.min(base.semis, 96),
    index: Math.min(base.index, 92),
  };
}

function blendHeat(baseValue: number, sentimentIntensity?: number) {
  if (typeof sentimentIntensity !== "number") {
    return baseValue;
  }

  return clamp(Math.round(baseValue * 0.62 + sentimentIntensity * 0.38), 20, 98);
}

function toState(item?: NormalizedNewsItem, sentimentLabel?: string) {
  if (item?.sentiment === "risk" || sentimentLabel === "偏空") {
    return "谨慎";
  }

  if (sentimentLabel === "偏多" || item?.sentiment === "bullish") {
    return "跟踪";
  }

  return "观察";
}

function toHeatLabel(item?: NormalizedNewsItem, sentimentIntensity?: number) {
  const combined = Math.max(item?.importance ?? 0, sentimentIntensity ?? 0);

  if (combined >= 88) {
    return "高热";
  }

  if (combined >= 74) {
    return "中高";
  }

  if (combined >= 58) {
    return "中等";
  }

  return "低位";
}

function buildSummaryLabel(summary: ReturnType<typeof buildSentimentSummary>) {
  if (summary.marketSignal === "分歧扩大") {
    return summary.focusStock
      ? `${summary.focusStock.ticker} 分歧扩大`
      : "主线分歧扩大";
  }

  if (summary.marketSignal === "情绪偏热") {
    return summary.focusSector
      ? `${summary.focusSector.name} 情绪偏热`
      : "市场情绪偏热";
  }

  if (summary.marketSignal === "情绪回落") {
    return "风险偏好回落";
  }

  if (summary.marketSignal === "情绪修复") {
    return summary.focusSector
      ? `${summary.focusSector.name} 情绪修复`
      : "情绪正在修复";
  }

  return summary.focusSector
    ? `${summary.focusSector.name} 继续观察`
    : "盘面仍可观察";
}

export async function getMarketSnapshotResult(
  profile: UserProfile = defaultProfile,
  frame = 0,
  normalizedItems: NormalizedNewsItem[] = [],
): Promise<MarketSnapshotResult> {
  const quote = await getQuoteProviderResult(profile, frame);
  const sentiment = await getSentimentProviderResult(profile);
  const basePortfolio = getDemoPortfolioSnapshot({
    profile,
    frame,
    quotes: quote.quotes,
  });
  const boardHeat = aggregateBoardHeat(normalizedItems);
  const lead = getLeadNews(normalizedItems, profile);
  const focusTicker = lead?.symbol ?? basePortfolio.focusTicker;
  const focusSectorKey = lead?.boardTone ?? inferBoardTone(profile.sectors[0] ?? "AI 基建");
  const sentimentSummary = buildSentimentSummary({
    snapshot: sentiment.snapshot,
    profile,
    focusTicker,
    sectorKey:
      focusSectorKey === "risk"
        ? "index"
        : focusSectorKey,
  });
  const symbolNews = new Map<string, NormalizedNewsItem>();

  for (const item of normalizedItems) {
    if (!symbolNews.has(item.symbol)) {
      symbolNews.set(item.symbol, item);
    }
  }

  const aiSignal = getSectorSentimentSignal(sentiment.snapshot, "ai");
  const cloudSignal = getSectorSentimentSignal(sentiment.snapshot, "cloud");
  const semisSignal = getSectorSentimentSignal(sentiment.snapshot, "semis");
  const indexSignal = getSectorSentimentSignal(sentiment.snapshot, "index");

  const portfolio: PortfolioSnapshot = {
    ...basePortfolio,
    focusTicker,
    postureLabel:
      sentimentSummary.marketSignal === "分歧扩大"
        ? "先看分歧收敛"
        : sentimentSummary.marketSignal === "情绪回落"
          ? "先看承接"
          : lead?.boardTone === "cloud"
            ? "稳住节奏"
            : basePortfolio.postureLabel,
    breadthSeries: [
      {
        label: profile.sectors[0] ?? aiSignal?.name ?? "AI 基建",
        value: blendHeat(boardHeat.ai, aiSignal?.intensity),
        sentimentLabel: aiSignal?.label,
        sentimentTrend: aiSignal?.trend,
        leaderTicker: aiSignal?.leaders[0],
      },
      {
        label: profile.sectors[1] ?? cloudSignal?.name ?? "云软件",
        value: blendHeat(boardHeat.cloud, cloudSignal?.intensity),
        sentimentLabel: cloudSignal?.label,
        sentimentTrend: cloudSignal?.trend,
        leaderTicker: cloudSignal?.leaders[0],
      },
      {
        label: semisSignal?.name ?? "半导体",
        value: blendHeat(boardHeat.semis, semisSignal?.intensity),
        sentimentLabel: semisSignal?.label,
        sentimentTrend: semisSignal?.trend,
        leaderTicker: semisSignal?.leaders[0],
      },
      {
        label: indexSignal?.name ?? "大盘",
        value: blendHeat(boardHeat.index, indexSignal?.intensity),
        sentimentLabel: indexSignal?.label,
        sentimentTrend: indexSignal?.trend,
        leaderTicker: indexSignal?.leaders[0],
      },
    ],
    watchTable: basePortfolio.watchTable.map((row) => {
      const item = symbolNews.get(row.ticker);
      const stockSignal = getStockSentimentSignal(sentiment.snapshot, row.ticker);

      return {
        ...row,
        name: item?.headlineTag ?? row.name,
        board: item?.sector ?? row.board,
        heat: toHeatLabel(item, stockSignal?.intensity),
        state: toState(item, stockSignal?.label),
        sentimentLabel: stockSignal?.label,
        sentimentScore: stockSignal?.intensity,
        sentimentTrend: stockSignal?.trend,
      };
    }),
    marketSnapshot: {
      availableLabel: buildSummaryLabel(sentimentSummary),
      focusBoardLabel: sentimentSummary.focusSector
        ? `${sentimentSummary.focusSector.name} / ${sentimentSummary.focusSector.label}`
        : basePortfolio.marketSnapshot.focusBoardLabel,
      noteLabel: sentimentSummary.focusStock
        ? `${sentimentSummary.focusStock.ticker} 情绪${sentimentSummary.focusStock.label}，当前处于“${sentimentSummary.focusStock.trend}”阶段。`
        : basePortfolio.marketSnapshot.noteLabel,
      indexLabel:
        sentimentSummary.marketSignal === "情绪偏热"
          ? "情绪偏热"
          : sentimentSummary.marketSignal === "分歧扩大"
            ? "分歧扩大"
            : sentimentSummary.marketSignal === "情绪回落"
              ? "风险回落"
              : basePortfolio.marketSnapshot.indexLabel,
    },
  };

  return {
    portfolio,
    source: "mock",
    quoteSource: quote.source,
    sentimentSource: sentiment.source,
    sentimentSnapshot: sentiment.snapshot,
  };
}
