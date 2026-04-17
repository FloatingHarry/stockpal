import { NextRequest, NextResponse } from "next/server";
import {
  defaultProfile,
  getProfileFromSearchParams,
  marketSummary,
  type SearchParams,
} from "@/lib/mock-data";
import { buildCompanionItemsFromNews } from "@/lib/companion-generator";
import { marketFeedSource, prepareMarketFeed } from "@/lib/market-feed";
import { getMarketSnapshotResult } from "@/lib/market-snapshot";

export const dynamic = "force-dynamic";

function getSearchParams(request: NextRequest): SearchParams {
  const url = new URL(request.url);

  return {
    companion: url.searchParams.get("companion") ?? undefined,
    holding: url.searchParams.getAll("holding"),
    sector: url.searchParams.getAll("sector"),
  };
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const profile = getProfileFromSearchParams(getSearchParams(request)) ?? defaultProfile;
  const companionId = url.searchParams.get("companion") ?? profile.companionId;
  const frame = Number(url.searchParams.get("frame") ?? "0");
  const resolvedFrame = Number.isFinite(frame) ? frame : 0;
  const preparedFeed = prepareMarketFeed(profile, resolvedFrame);
  const snapshot = await getMarketSnapshotResult(
    profile,
    resolvedFrame,
    preparedFeed.normalizedItems,
  );
  const companionItems = buildCompanionItemsFromNews({
    profile,
    companionId,
    items: preparedFeed.normalizedItems,
    portfolio: snapshot.portfolio,
  });

  return NextResponse.json({
    scenarioId: `mock-frame-${resolvedFrame}`,
    systemClockLabel: marketSummary.systemClockLabel,
    files: marketFeedSource.files,
    items: preparedFeed.items,
    portfolio: snapshot.portfolio,
    companionItems,
    source: {
      feed: preparedFeed.source,
      snapshot: snapshot.source,
      companion: "mock",
      quote: snapshot.quoteSource,
    },
  });
}
