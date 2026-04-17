import type { MarketFeedItem } from "@/lib/market-feed";
import type { UserProfile } from "@/lib/mock-data";
import type { NormalizedNewsItem } from "@/lib/news-normalizer";

function getEventBonus(eventType: NormalizedNewsItem["eventType"]) {
  switch (eventType) {
    case "earnings":
      return 14;
    case "guidance":
      return 11;
    case "orders":
      return 10;
    case "rotation":
      return 8;
    case "risk":
      return 9;
    case "macro":
      return 5;
    default:
      return 6;
  }
}

export function rankNewsItems(
  items: NormalizedNewsItem[],
  profile: UserProfile,
): NormalizedNewsItem[] {
  const deduped = items.filter(
    (item, index, all) =>
      index ===
      all.findIndex(
        (candidate) =>
          candidate.symbol === item.symbol &&
          candidate.eventType === item.eventType &&
          candidate.title === item.title,
      ),
  );

  return [...deduped].sort((left, right) => {
    const leftHolding = profile.holdings.includes(left.symbol) ? 12 : 0;
    const rightHolding = profile.holdings.includes(right.symbol) ? 12 : 0;
    const leftSector = profile.sectors.some((sector) => left.sector.includes(sector.replace(/\s/g, "")))
      ? 5
      : 0;
    const rightSector = profile.sectors.some((sector) => right.sector.includes(sector.replace(/\s/g, "")))
      ? 5
      : 0;

    const leftScore = left.relevanceScore + getEventBonus(left.eventType) + leftHolding + leftSector;
    const rightScore =
      right.relevanceScore + getEventBonus(right.eventType) + rightHolding + rightSector;

    return rightScore - leftScore;
  });
}

export function buildRankedMarketFeed(
  items: NormalizedNewsItem[],
  profile: UserProfile,
  minimumCount = 6,
): MarketFeedItem[] {
  const ranked = rankNewsItems(items, profile);
  const expanded = ranked.length >= minimumCount ? ranked : [...ranked, ...ranked.slice(0, minimumCount - ranked.length)];

  return expanded.slice(0, Math.max(minimumCount, Math.min(expanded.length, 8))).map((item) => ({
    id: item.id,
    symbol: item.symbol,
    title: `${item.company}：${item.title.replace(/^.*?：/, "").replace(/^.*?:/, "").trim()}`,
    summary: item.brief,
    timestamp: item.timestamp,
    source: item.sourceLabel,
    sentiment: item.sentiment,
    headlineTag: item.headlineTag,
    relevanceScore: item.relevanceScore,
    boardTone: item.boardTone,
  }));
}

export function getLeadNews(items: NormalizedNewsItem[], profile: UserProfile) {
  return rankNewsItems(items, profile)[0] ?? null;
}
