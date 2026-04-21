import { NextRequest, NextResponse } from "next/server";
import { defaultProfile, getProfileFromSearchParams, type SearchParams } from "@/lib/mock-data";
import { getMarketHomePayload } from "@/lib/market-home";

export const dynamic = "force-dynamic";

function getSearchParams(request: NextRequest): SearchParams {
  return {
    companion: request.nextUrl.searchParams.get("companion") ?? undefined,
    holding: request.nextUrl.searchParams.getAll("holding"),
    sector: request.nextUrl.searchParams.getAll("sector"),
  };
}

export async function GET(request: NextRequest) {
  const profile = getProfileFromSearchParams(getSearchParams(request)) ?? defaultProfile;
  const companionId = request.nextUrl.searchParams.get("companion") ?? profile.companionId;
  const frame = Number(request.nextUrl.searchParams.get("frame") ?? "0");
  const resolvedFrame = Number.isFinite(frame) ? frame : 0;
  const payload = await getMarketHomePayload({
    profile,
    companionId,
    frame: resolvedFrame,
  });

  return NextResponse.json(payload);
}

