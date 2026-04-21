import { defaultProfile, type UserProfile } from "@/lib/mock-data";
import { normalizeRawNews, type NormalizedNewsItem } from "@/lib/news-normalizer";
import { buildRankedMarketFeed } from "@/lib/news-ranker";
import { getDemoRawNews, type RawNewsItem } from "@/lib/raw-news";

export type MarketFeedItem = {
  id: string;
  symbol: string;
  title: string;
  summary: string;
  timestamp: string;
  source: string;
  sentiment: "bullish" | "neutral" | "risk";
  headlineTag?: string;
  relevanceScore?: number;
  boardTone?: "ai" | "cloud" | "semis" | "index" | "risk";
};

export type MarketFeedResult = {
  items: MarketFeedItem[];
  source: "mock";
};

export type PreparedMarketFeed = {
  rawItems: RawNewsItem[];
  normalizedItems: NormalizedNewsItem[];
  items: MarketFeedItem[];
  source: "mock";
};

export type MarketFeedSource = {
  files: string[];
  getFeed: (profile?: UserProfile, frame?: number) => Promise<MarketFeedItem[]>;
};

const providerFiles = [
  "raw-news.mock.json",
  "normalized-events.mock.json",
  "ranked-briefs.mock.json",
  "companion-prompts.mock.json",
  "stockpal-sentiment.snapshot.json",
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getMarketRefreshMinutes() {
  const value = Number(process.env.MARKET_REFRESH_MINUTES ?? "5");

  if (!Number.isFinite(value)) {
    return 5;
  }

  return clamp(Math.round(value), 1, 60);
}

export function getMarketRefreshMs() {
  return getMarketRefreshMinutes() * 60 * 1000;
}

export function prepareMarketFeed(
  profile: UserProfile = defaultProfile,
  frame = 0,
): PreparedMarketFeed {
  const rawItems = getDemoRawNews(profile, frame);
  const normalizedItems = normalizeRawNews(rawItems);
  const items = buildRankedMarketFeed(normalizedItems, profile);

  return {
    rawItems,
    normalizedItems,
    items,
    source: "mock",
  };
}

export async function getMarketFeedResult(
  profile: UserProfile = defaultProfile,
  frame = 0,
): Promise<MarketFeedResult> {
  const prepared = prepareMarketFeed(profile, frame);

  return {
    items: prepared.items,
    source: prepared.source,
  };
}

export const marketFeedSource: MarketFeedSource = {
  files: providerFiles,
  async getFeed(profile, frame) {
    const result = await getMarketFeedResult(profile ?? defaultProfile, frame ?? 0);
    return result.items;
  },
};
