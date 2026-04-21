import { HomeScreen } from "@/components/HomeScreen";
import { getMarketHomePayload } from "@/lib/market-home";
import { defaultProfile, getProfileFromSearchParams, type SearchParams } from "@/lib/mock-data";
import { getMarketRefreshMs } from "@/lib/market-feed";

type HomeProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Home({ searchParams }: HomeProps) {
  const resolvedSearchParams = await searchParams;
  const profile = getProfileFromSearchParams(resolvedSearchParams) ?? defaultProfile;
  const payload = await getMarketHomePayload({
    profile,
    companionId: profile.companionId,
    frame: 0,
  });

  return (
    <HomeScreen
      companionItems={payload.companionItems}
      feedItems={payload.items}
      files={payload.files}
      profile={profile}
      portfolio={payload.portfolio}
      refreshMs={getMarketRefreshMs()}
      systemClockLabel={payload.systemClockLabel}
    />
  );
}

