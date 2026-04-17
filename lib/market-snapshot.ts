import { getDemoPortfolioSnapshot } from "@/lib/demo-content";
import { defaultProfile, type PortfolioSnapshot, type UserProfile } from "@/lib/mock-data";
import type { NormalizedNewsItem } from "@/lib/news-normalizer";
import { getLeadNews } from "@/lib/news-ranker";
import { getQuoteProviderResult } from "@/lib/quote-provider";

export type MarketSnapshotResult = {
  portfolio: PortfolioSnapshot;
  source: "mock";
  quoteSource: "mock";
};

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

function toState(item?: NormalizedNewsItem) {
  if (!item) {
    return "观察";
  }

  if (item.sentiment === "risk") {
    return "谨慎";
  }

  if (item.sentiment === "bullish") {
    return "跟踪";
  }

  return "观察";
}

function toHeatLabel(item?: NormalizedNewsItem) {
  if (!item) {
    return "中";
  }

  if (item.importance >= 88) {
    return "高";
  }

  if (item.importance >= 74) {
    return "中高";
  }

  return "中";
}

export async function getMarketSnapshotResult(
  profile: UserProfile = defaultProfile,
  frame = 0,
  normalizedItems: NormalizedNewsItem[] = [],
): Promise<MarketSnapshotResult> {
  const quote = await getQuoteProviderResult(profile, frame);
  const basePortfolio = getDemoPortfolioSnapshot({
    profile,
    frame,
    quotes: quote.quotes,
  });
  const boardHeat = aggregateBoardHeat(normalizedItems);
  const lead = getLeadNews(normalizedItems, profile);
  const symbolNews = new Map<string, NormalizedNewsItem>();

  for (const item of normalizedItems) {
    if (!symbolNews.has(item.symbol)) {
      symbolNews.set(item.symbol, item);
    }
  }

  const portfolio: PortfolioSnapshot = {
    ...basePortfolio,
    focusTicker: lead?.symbol ?? basePortfolio.focusTicker,
    postureLabel:
      lead?.sentiment === "risk"
        ? "先看承接"
        : lead?.boardTone === "semis"
          ? "弹性回到前排"
          : lead?.boardTone === "cloud"
            ? "稳住节奏"
            : "主线继续观察",
    breadthSeries: [
      { label: "AI", value: boardHeat.ai },
      { label: "云", value: boardHeat.cloud },
      { label: "半导体", value: boardHeat.semis },
      { label: "指数", value: boardHeat.index },
    ],
    watchTable: basePortfolio.watchTable.map((row) => {
      const item = symbolNews.get(row.ticker);

      return {
        ...row,
        name: item?.headlineTag ?? row.name,
        board: item?.sector ?? row.board,
        heat: toHeatLabel(item),
        state: toState(item),
      };
    }),
    marketSnapshot: {
      availableLabel: `有效信号 ${Math.min(
        99,
        58 + Math.round((boardHeat.ai + boardHeat.cloud + boardHeat.semis) / 6),
      )}%`,
      focusBoardLabel: lead ? `${lead.sector} 仍是一号观察区` : basePortfolio.marketSnapshot.focusBoardLabel,
      noteLabel:
        lead?.sentiment === "risk"
          ? "高位分歧扩大，先看承接和回撤，再决定是否继续追热点。"
          : `当前主屏焦点围绕 ${lead?.symbol ?? basePortfolio.focusTicker} 与 ${lead?.sector ?? "主线板块"} 展开。`,
      indexLabel:
        lead?.sentiment === "risk"
          ? "风险偏好回落"
          : lead?.boardTone === "index"
            ? "指数等待方向"
            : "成长风格偏强",
    },
  };

  return {
    portfolio,
    source: "mock",
    quoteSource: quote.source,
  };
}
