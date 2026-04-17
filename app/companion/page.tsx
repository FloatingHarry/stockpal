import Link from "next/link";
import { FeedList } from "@/components/FeedList";
import { PixelAvatar } from "@/components/PixelAvatar";
import { PixelWindow } from "@/components/PixelWindow";
import { StatusHeader } from "@/components/StatusHeader";
import { buildCompanionItemsFromNews } from "@/lib/companion-generator";
import { prepareMarketFeed } from "@/lib/market-feed";
import { getMarketSnapshotResult } from "@/lib/market-snapshot";
import {
  buildHomeHref,
  defaultProfile,
  getCompanionById,
  getProfileFromSearchParams,
  resolveBehaviorState,
  type SearchParams,
} from "@/lib/mock-data";

type CompanionPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function CompanionPage({
  searchParams,
}: CompanionPageProps) {
  const resolvedSearchParams = await searchParams;
  const profile = getProfileFromSearchParams(resolvedSearchParams) ?? defaultProfile;
  const companion = getCompanionById(profile.companionId);
  const behaviorState = resolveBehaviorState(companion, 1);
  const preparedFeed = prepareMarketFeed(profile, 0);
  const snapshot = await getMarketSnapshotResult(profile, 0, preparedFeed.normalizedItems);
  const feedItems = buildCompanionItemsFromNews({
    profile,
    companionId: companion.id,
    items: preparedFeed.normalizedItems,
    portfolio: snapshot.portfolio,
  });

  return (
    <main className="screen-shell text-stone-950">
      <div className="screen-frame">
        <StatusHeader
          actions={
            <Link className="pixel-button bg-[#f8f4df]" href={buildHomeHref(profile)}>
              返回主界面
            </Link>
          }
          dateLabel="2026/04/07 周二"
          headline={companion.strategyLabelZh}
          marketLabel="角色详情"
          subtitle="角色标签、行为状态和历史播报"
          title={`${companion.displayNameZh} 档案页`}
        />

        <section className="mt-4 grid gap-4 xl:grid-cols-[0.98fr_1.02fr]">
          <PixelWindow title="角色卡" label={companion.roleLabelZh}>
            <div className="grid gap-4">
              <PixelAvatar companion={companion} behaviorState={behaviorState} />

              <div className="companion-panel__speech">
                <div className="companion-panel__speech-meta">
                  <span>当前动作</span>
                  <span>{behaviorState.label}</span>
                </div>
                <p>{behaviorState.bubble}</p>
              </div>

              <div className="companion-panel__profile">
                <div className="companion-panel__row">
                  <span>名称</span>
                  <strong>{companion.displayNameZh}</strong>
                </div>
                <div className="companion-panel__row">
                  <span>风格</span>
                  <strong>{companion.signature}</strong>
                </div>
                <div className="companion-panel__row companion-panel__row--strategy">
                  <span>简介</span>
                  <strong>{companion.persona}</strong>
                </div>
              </div>

              <div className="grid gap-2">
                {companion.behaviorStates.map((state) => (
                  <div key={state.key} className="companion-state-card">
                    <div className="companion-state-card__top">
                      <span>{state.label}</span>
                      <span>{state.animation}</span>
                    </div>
                    <p>{state.posture}</p>
                  </div>
                ))}
              </div>
            </div>
          </PixelWindow>

          <PixelWindow title="播报与策略" label={`${feedItems.length} 条记录`}>
            <div className="grid gap-4">
              <div className="pixel-card pixel-card--warm p-4">
                <p className="pixel-label text-stone-700">角色提示词</p>
                <p className="mt-2 text-sm leading-6">{companion.stylePrompt}</p>
              </div>

              <div className="pixel-card pixel-card--paper p-4">
                <div className="flex items-center justify-between">
                  <p className="pixel-label text-stone-700">当前档位</p>
                  <span className="tag bg-[#d9f3ff]">{companion.defaultMood}</span>
                </div>
                <div className="mt-3 grid gap-2">
                  {companion.voiceLines.map((line, index) => (
                    <div
                      key={line}
                      className="border-[3px] border-stone-950 bg-white px-3 py-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-black">语气样本 {index + 1}</span>
                        <span className="pixel-mono text-xs font-black">
                          {behaviorState.label}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6">{line}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pixel-card pixel-card--soft p-4">
                <p className="pixel-label text-stone-700">历史播报</p>
                <div className="mt-3">
                  <FeedList feedItems={feedItems} />
                </div>
              </div>
            </div>
          </PixelWindow>
        </section>
      </div>
    </main>
  );
}
