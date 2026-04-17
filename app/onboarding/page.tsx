import Link from "next/link";
import { PixelAvatar } from "@/components/PixelAvatar";
import { PixelWindow } from "@/components/PixelWindow";
import { StatusHeader } from "@/components/StatusHeader";
import { companions, defaultProfile } from "@/lib/mock-data";

export default function OnboardingPage() {
  const defaultCompanion = companions[0];
  const defaultState = defaultCompanion.behaviorStates[0];

  return (
    <main className="screen-shell text-stone-950">
      <div className="screen-frame">
        <StatusHeader
          actions={
            <Link className="pixel-button bg-[#f8f4df]" href="/">
              返回主界面
            </Link>
          }
          dateLabel="2026/04/07 周二"
          headline="默认使用预设档案直达首页"
          marketLabel="附属入口"
          subtitle="当前阶段先把首页做完整，这里保留轻量建档入口"
          title="StockPal 预设档案台"
        />

        <section className="mt-4 grid gap-4 xl:grid-cols-[0.92fr_1.08fr_1fr]">
          <PixelWindow title="当前模式说明" label="体验优先">
            <div className="space-y-4">
              <div className="pixel-card pixel-card--sky p-4 text-sm leading-6">
                这一版把重点放在稳定演示的首页体验，所以默认使用预设档案直接进入主界面，
                让你一打开就能看到完整的市场快讯、图表和角色陪看效果。
              </div>
              <div className="pixel-card pixel-card--paper p-4">
                <p className="pixel-label text-stone-700">当前预设档案</p>
                <div className="mt-3 grid gap-2 text-sm leading-6">
                  <p>股票: {defaultProfile.holdings.join(" / ")}</p>
                  <p>板块: {defaultProfile.sectors.join(" / ")}</p>
                  <p>搭子: {defaultCompanion.displayNameZh}</p>
                </div>
              </div>
              <div className="pixel-card pixel-card--warm p-4">
                <p className="text-sm leading-6">
                  等首页视觉和滚动逻辑完全稳定以后，再继续补用户输入、保存档案和更强的个性化逻辑。
                </p>
              </div>
            </div>
          </PixelWindow>

          <PixelWindow title="轻量建档入口" label="备用表单">
            <form action="/" className="grid gap-6">
              <div>
                <label className="field-label" htmlFor="holding1">
                  股票代码
                </label>
                <p className="helper-text">
                  你现在仍然可以临时换一组观察池，但主体体验重点已经转到首页。
                </p>
                <div className="mt-3 grid gap-3">
                  <input
                    className="pixel-input pixel-mono"
                    defaultValue={defaultProfile.holdings[0]}
                    id="holding1"
                    maxLength={5}
                    name="holding"
                    placeholder="AAPL"
                  />
                  <input
                    className="pixel-input pixel-mono"
                    defaultValue={defaultProfile.holdings[1]}
                    maxLength={5}
                    name="holding"
                    placeholder="MSFT"
                  />
                  <input
                    className="pixel-input pixel-mono"
                    defaultValue={defaultProfile.holdings[2]}
                    maxLength={5}
                    name="holding"
                    placeholder="NVDA"
                  />
                </div>
              </div>

              <div>
                <label className="field-label" htmlFor="sector1">
                  关注板块
                </label>
                <div className="mt-3 grid gap-3">
                  <input
                    className="pixel-input"
                    defaultValue={defaultProfile.sectors[0]}
                    id="sector1"
                    name="sector"
                    placeholder="AI 基建"
                  />
                  <input
                    className="pixel-input"
                    defaultValue={defaultProfile.sectors[1]}
                    name="sector"
                    placeholder="云软件"
                  />
                </div>
              </div>

              <button className="pixel-button w-full bg-[#d7ebfb]" type="submit">
                用这组档案进入首页
              </button>
            </form>
          </PixelWindow>

          <PixelWindow title="默认搭子展示" label={defaultCompanion.roleLabelZh}>
            <div className="space-y-4">
              <div className="pixel-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-black">
                    {defaultCompanion.displayNameZh}
                  </span>
                  <span
                    className="tag"
                    style={{ backgroundColor: defaultCompanion.badgeColor }}
                  >
                    {defaultCompanion.signature}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6">{defaultCompanion.persona}</p>
              </div>

              <PixelAvatar companion={defaultCompanion} behaviorState={defaultState} />

              <div className="companion-panel__speech">
                <div className="companion-panel__speech-meta">
                  <span>预设台词</span>
                  <span>{defaultState.label}</span>
                </div>
                <p>{defaultState.bubble}</p>
              </div>
            </div>
          </PixelWindow>
        </section>
      </div>
    </main>
  );
}
