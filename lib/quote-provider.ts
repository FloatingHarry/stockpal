import { defaultProfile, type UserProfile } from "@/lib/mock-data";
import { getDemoQuotePoints } from "@/lib/demo-content";

export type QuotePoint = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
};

export type QuoteProviderResult = {
  quotes: QuotePoint[];
  source: "mock";
};

export async function getQuoteProviderResult(
  profile: UserProfile = defaultProfile,
  frame = 0,
): Promise<QuoteProviderResult> {
  return {
    quotes: getDemoQuotePoints(profile, frame),
    source: "mock",
  };
}
