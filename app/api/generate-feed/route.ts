import { NextRequest, NextResponse } from "next/server";
import { buildCompanionItemsFromNews } from "@/lib/companion-generator";
import { defaultProfile, getCompanionById, type UserProfile } from "@/lib/mock-data";
import { prepareMarketFeed } from "@/lib/market-feed";
import { getMarketSnapshotResult } from "@/lib/market-snapshot";

export const dynamic = "force-dynamic";

type GenerateFeedRequest = {
  companionId?: string;
  holdings?: string[];
  sectors?: string[];
  frame?: number;
};

function normalizeProfile(payload?: GenerateFeedRequest): UserProfile {
  const holdings =
    payload?.holdings?.map((item) => item.toUpperCase()).slice(0, 3) ??
    defaultProfile.holdings;
  const sectors = payload?.sectors?.slice(0, 2) ?? defaultProfile.sectors;
  const companionId = getCompanionById(
    payload?.companionId ?? defaultProfile.companionId,
  ).id;

  return {
    holdings: holdings.length > 0 ? holdings : defaultProfile.holdings,
    sectors: sectors.length > 0 ? sectors : defaultProfile.sectors,
    companionId,
  };
}

export async function POST(request: NextRequest) {
  let payload: GenerateFeedRequest | undefined;

  try {
    payload = (await request.json()) as GenerateFeedRequest;
  } catch {
    payload = undefined;
  }

  const profile = normalizeProfile(payload);
  const frame = Number(payload?.frame ?? 0);
  const companionId = payload?.companionId ?? profile.companionId;
  const resolvedFrame = Number.isFinite(frame) ? frame : 0;
  const preparedFeed = prepareMarketFeed(profile, resolvedFrame);
  const snapshot = await getMarketSnapshotResult(
    profile,
    resolvedFrame,
    preparedFeed.normalizedItems,
  );
  const items = buildCompanionItemsFromNews({
    profile,
    companionId,
    items: preparedFeed.normalizedItems,
    portfolio: snapshot.portfolio,
  });

  return NextResponse.json({
    source: "mock",
    items,
  });
}
