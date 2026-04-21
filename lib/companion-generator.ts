import {
  getCompanionById,
  type FeedItem,
  type PortfolioSnapshot,
  type UserProfile,
} from "@/lib/mock-data";
import type { NormalizedNewsItem } from "@/lib/news-normalizer";
import { getLeadNews, rankNewsItems } from "@/lib/news-ranker";
import {
  buildSentimentSummary,
  getSectorSentimentSignal,
  getStockSentimentSignal,
  type SectorKey,
  type SentimentSnapshot,
} from "@/lib/sentiment-provider";

function resolveSectorKey(item: NormalizedNewsItem): SectorKey {
  if (item.boardTone === "risk") {
    return "index";
  }

  return item.boardTone;
}

function describeStockSignal(
  signal: ReturnType<typeof getStockSentimentSignal>,
  ticker: string,
) {
  if (!signal) {
    return `${ticker} 这条先看承接`;
  }

  return `${ticker} 的讨论情绪${signal.label}，现在处在“${signal.trend}”阶段`;
}

function describeSectorSignal(signal: ReturnType<typeof getSectorSentimentSignal>, fallback: string) {
  if (!signal) {
    return `${fallback} 先看热度能不能续上`;
  }

  return `${signal.name} 这边是“${signal.label} / ${signal.trend}”`;
}

function buildLineByCompanion(
  companionId: string,
  item: NormalizedNewsItem,
  profile: UserProfile,
  portfolio: PortfolioSnapshot,
  sentimentSnapshot?: SentimentSnapshot,
) {
  const sectorKey = resolveSectorKey(item);
  const stockSignal = getStockSentimentSignal(sentimentSnapshot, item.symbol);
  const sectorSignal = getSectorSentimentSignal(sentimentSnapshot, sectorKey);
  const summary = sentimentSnapshot
    ? buildSentimentSummary({
        snapshot: sentimentSnapshot,
        profile,
        focusTicker: portfolio.focusTicker,
        sectorKey,
      })
    : null;

  if (companionId === "code-bro") {
    return `${item.symbol} 继续承接 ${item.headlineTag}，${describeStockSignal(stockSignal, item.symbol)}。${
      sectorSignal
        ? `${sectorSignal.name} 当前${sectorSignal.label}，适合当辅助确认信号。`
        : `${item.sector} 暂时还是以结构观察为主。`
    }`;
  }

  if (companionId === "fomo-trader") {
    return `${item.symbol} 这条把 ${item.sector} 的聊天室又点热了，${describeStockSignal(
      stockSignal,
      item.symbol,
    )}。${
      summary?.marketSignal === "分歧扩大"
        ? "但现在追的人一多，分歧也会一起变大。"
        : summary?.marketSignal === "情绪偏热"
          ? "这波情绪是热的，节奏很容易继续被它带着走。"
          : `${describeSectorSignal(sectorSignal, item.sector)}，这波还有继续发酵的味道。`
    }`;
  }

  return `${item.symbol} 先别只看这条消息，${describeStockSignal(stockSignal, item.symbol)}。${
    sectorSignal
      ? `${sectorSignal.name} 这边我更想先看承接和分歧怎么走。`
      : `${item.sector} 先看下一段热度能不能站住。`
  }`;
}

export function buildCompanionItemsFromNews({
  profile,
  companionId,
  items,
  portfolio,
  sentimentSnapshot,
}: {
  profile: UserProfile;
  companionId: string;
  items: NormalizedNewsItem[];
  portfolio: PortfolioSnapshot;
  sentimentSnapshot?: SentimentSnapshot;
}): FeedItem[] {
  const companion = getCompanionById(companionId);
  const ranked = rankNewsItems(items, profile).slice(0, 3);
  const lead = getLeadNews(items, profile);
  const toneTags = ["情绪", "板块", "提醒"];
  const timestamps = ["09:48", "10:26", "11:42"];

  return ranked.map((item, index) => {
    const target = index === 0 && lead ? lead : item;

    return {
      id: `${companion.id}-${target.id}-${index + 1}`,
      companionId: companion.id,
      content: buildLineByCompanion(
        companion.id,
        target,
        profile,
        portfolio,
        sentimentSnapshot,
      ),
      toneTag: toneTags[index] ?? "播报",
      createdAt: timestamps[index] ?? "12:06",
      boardTone: target.boardTone,
    };
  });
}

