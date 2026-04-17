import type { RawNewsItem } from "@/lib/raw-news";

export type NormalizedNewsItem = {
  id: string;
  symbol: string;
  company: string;
  title: string;
  brief: string;
  sourceLabel: string;
  timestamp: string;
  sector: string;
  boardTone: RawNewsItem["boardTone"];
  eventType:
    | "earnings"
    | "guidance"
    | "orders"
    | "rotation"
    | "momentum"
    | "risk"
    | "macro";
  sentiment: RawNewsItem["sentimentHint"];
  importance: number;
  relevanceScore: number;
  headlineTag: string;
};

const companyNames: Record<string, string> = {
  AAPL: "苹果",
  AMD: "AMD",
  DIA: "道指 ETF",
  META: "Meta",
  MSFT: "微软",
  NVDA: "英伟达",
  QQQ: "纳指 ETF",
  SPY: "标普 ETF",
  TSLA: "特斯拉",
};

const sourceLabels: Record<string, string> = {
  "财经联监测": "资讯池",
  "路径摘要": "情报稿",
  "市场情绪": "热榜池",
  "指数播报": "指数稿",
  "热点梳理": "复盘流",
  "预期管理": "财报稿",
  "机构摘要": "机构流",
  "热榜追踪": "热榜池",
  "盘中快照": "盘中稿",
  "主题复盘": "主题稿",
  "盘口监测": "盘口流",
  "资金流向": "资金流",
  "热度扫描": "热榜池",
  "风险雷达": "风控稿",
  "风格跟踪": "轮动稿",
  "情绪监测": "情绪流",
  "指数快讯": "指数稿",
  "风格播报": "风格稿",
};

function inferSector(boardTone: RawNewsItem["boardTone"]) {
  switch (boardTone) {
    case "ai":
      return "AI 基建";
    case "cloud":
      return "云软件";
    case "semis":
      return "半导体";
    case "risk":
      return "风险监控";
    default:
      return "指数观察";
  }
}

function inferEventType(raw: RawNewsItem): NormalizedNewsItem["eventType"] {
  const text = `${raw.headline} ${raw.body} ${raw.topicHint ?? ""}`;

  if (/(财报|业绩|估值|前瞻|指引)/.test(text)) {
    return "earnings";
  }

  if (/(预算|修复|续签|续约|指引上修)/.test(text)) {
    return "guidance";
  }

  if (/(订单|资本开支|交付|部署)/.test(text)) {
    return "orders";
  }

  if (/(轮动|切换|接力|扩散)/.test(text)) {
    return "rotation";
  }

  if (/(高位分歧|风险|回撤|分歧|防守)/.test(text) || raw.boardTone === "risk") {
    return "risk";
  }

  if (/(指数|大盘|纳指|标普)/.test(text) || raw.boardTone === "index") {
    return "macro";
  }

  return "momentum";
}

function computeImportance(
  raw: RawNewsItem,
  eventType: NormalizedNewsItem["eventType"],
) {
  const baseByTone: Record<RawNewsItem["boardTone"], number> = {
    ai: 80,
    cloud: 72,
    semis: 76,
    index: 64,
    risk: 78,
  };
  const bonusByEvent: Record<NormalizedNewsItem["eventType"], number> = {
    earnings: 12,
    guidance: 10,
    orders: 8,
    rotation: 6,
    momentum: 5,
    risk: 9,
    macro: 4,
  };
  const sentimentBonus =
    raw.sentimentHint === "bullish"
      ? 4
      : raw.sentimentHint === "risk"
        ? 3
        : 0;

  return Math.min(99, baseByTone[raw.boardTone] + bonusByEvent[eventType] + sentimentBonus);
}

function buildBrief(raw: RawNewsItem, sector: string, eventType: NormalizedNewsItem["eventType"]) {
  const prefixByEvent: Record<NormalizedNewsItem["eventType"], string> = {
    earnings: "财报线索抬升，市场开始提前交易预期差。",
    guidance: "指引和企业预算成为资金重新定价的依据。",
    orders: "订单和交付节奏决定这条线能否继续接力。",
    rotation: "资金在旧热点与新接力之间做切换。",
    momentum: "热度仍在前排，短线节奏偏强。",
    risk: "高位分歧放大，先看承接与回撤控制。",
    macro: "指数环境更多提供市场情绪背景。",
  };

  return `${prefixByEvent[eventType]} ${raw.body}`.trim();
}

export function normalizeRawNews(raw: RawNewsItem[]): NormalizedNewsItem[] {
  return raw.map((item) => {
    const eventType = inferEventType(item);
    const sector = inferSector(item.boardTone);
    const company = companyNames[item.symbol] ?? item.symbol;
    const headlineTag = item.topicHint ?? sector;
    const importance = computeImportance(item, eventType);
    const relevanceScore = Math.min(
      99,
      importance + (item.symbol === "SPY" || item.symbol === "QQQ" ? -8 : 4),
    );

    return {
      id: item.id,
      symbol: item.symbol,
      company,
      title: item.headline,
      brief: buildBrief(item, sector, eventType),
      sourceLabel: sourceLabels[item.source] ?? item.source,
      timestamp: item.publishedAt,
      sector,
      boardTone: item.boardTone,
      eventType,
      sentiment: item.sentimentHint,
      importance,
      relevanceScore,
      headlineTag,
    };
  });
}
