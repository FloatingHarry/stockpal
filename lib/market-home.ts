import { getDemoHomePayload } from "@/lib/demo-content";
import { buildCompanionItemsFromNews } from "@/lib/companion-generator";
import { defaultProfile, type FeedItem, type PortfolioSnapshot, type UserProfile } from "@/lib/mock-data";
import { marketFeedSource, prepareMarketFeed, type MarketFeedItem } from "@/lib/market-feed";
import { getMarketSnapshotResult } from "@/lib/market-snapshot";

export type MarketHomePayload = {
  scenarioId: string;
  systemClockLabel: string;
  files: string[];
  items: MarketFeedItem[];
  portfolio: PortfolioSnapshot;
  companionItems: FeedItem[];
  source: {
    feed: "mock";
    snapshot: "mock";
    companion: "mock";
    quote: "mock";
    sentiment: "offline-bert" | "mock";
  };
};

export async function getMarketHomePayload({
  profile = defaultProfile,
  companionId = profile.companionId,
  frame = 0,
}: {
  profile?: UserProfile;
  companionId?: string;
  frame?: number;
} = {}): Promise<MarketHomePayload> {
  const preparedFeed = prepareMarketFeed(profile, frame);
  const snapshot = await getMarketSnapshotResult(profile, frame, preparedFeed.normalizedItems);
  const companionItems = buildCompanionItemsFromNews({
    profile,
    companionId,
    items: preparedFeed.normalizedItems,
    portfolio: snapshot.portfolio,
    sentimentSnapshot: snapshot.sentimentSnapshot,
  });
  const sceneMeta = getDemoHomePayload({
    profile,
    companionId,
    frame,
  });

  return {
    scenarioId: sceneMeta.scenarioId,
    systemClockLabel: sceneMeta.systemClockLabel,
    files: marketFeedSource.files,
    items: preparedFeed.items,
    portfolio: snapshot.portfolio,
    companionItems,
    source: {
      feed: preparedFeed.source,
      snapshot: snapshot.source,
      companion: "mock",
      quote: snapshot.quoteSource,
      sentiment: snapshot.sentimentSource,
    },
  };
}

