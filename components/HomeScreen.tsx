"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useState, type ReactNode } from "react";
import { CompanionPanel } from "@/components/CompanionPanel";
import { InfoFeedPanel } from "@/components/InfoFeedPanel";
import { MarketDisplayPanel } from "@/components/MarketDisplayPanel";
import {
  companions,
  getCompanionById,
  marketSummary,
  resolveBehaviorState,
  type FeedItem,
  type PortfolioSnapshot,
  type UserProfile,
} from "@/lib/mock-data";
import type { MarketFeedItem } from "@/lib/market-feed";

const DEMO_ROTATE_MS = 15_000;

type HomeScreenProps = {
  profile: UserProfile;
  feedItems: MarketFeedItem[];
  files: string[];
  portfolio: PortfolioSnapshot;
  companionItems: FeedItem[];
  systemClockLabel: string;
  refreshMs: number;
};

type MarketHomeResponse = {
  files?: string[];
  items?: MarketFeedItem[];
  portfolio?: PortfolioSnapshot;
  companionItems?: FeedItem[];
  systemClockLabel?: string;
};

function buildCompanionHref(profile: UserProfile, companionId: string) {
  const params = new URLSearchParams();

  profile.holdings.forEach((holding) => params.append("holding", holding));
  profile.sectors.forEach((sector) => params.append("sector", sector));
  params.set("companion", companionId);

  return `/companion?${params.toString()}`;
}

function buildMarketHomeHref(
  profile: UserProfile,
  companionId: string,
  frame: number,
) {
  const params = new URLSearchParams();

  profile.holdings.forEach((holding) => params.append("holding", holding));
  profile.sectors.forEach((sector) => params.append("sector", sector));
  params.set("companion", companionId);
  params.set("frame", String(frame));

  return `/api/market-home?${params.toString()}`;
}

function useDemoMarketData(
  endpoint: string,
  refreshMs: number,
  initialFiles: string[],
  initialFeedItems: MarketFeedItem[],
  initialPortfolio: PortfolioSnapshot,
  initialCompanionItems: FeedItem[],
  initialClockLabel: string,
) {
  const [liveFiles, setLiveFiles] = useState(initialFiles);
  const [liveFeedItems, setLiveFeedItems] = useState(initialFeedItems);
  const [livePortfolio, setLivePortfolio] = useState(initialPortfolio);
  const [liveCompanionItems, setLiveCompanionItems] = useState(initialCompanionItems);
  const [liveClockLabel, setLiveClockLabel] = useState(initialClockLabel);

  useEffect(() => {
    setLiveFiles(initialFiles);
  }, [initialFiles]);

  useEffect(() => {
    setLiveFeedItems(initialFeedItems);
  }, [initialFeedItems]);

  useEffect(() => {
    setLivePortfolio(initialPortfolio);
  }, [initialPortfolio]);

  useEffect(() => {
    setLiveCompanionItems(initialCompanionItems);
  }, [initialCompanionItems]);

  useEffect(() => {
    setLiveClockLabel(initialClockLabel);
  }, [initialClockLabel]);

  useEffect(() => {
    let disposed = false;

    async function refresh() {
      try {
        const response = await fetch(endpoint, {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as MarketHomeResponse;

        if (disposed) {
          return;
        }

        startTransition(() => {
          if (Array.isArray(payload.files) && payload.files.length > 0) {
            setLiveFiles(payload.files);
          }

          if (Array.isArray(payload.items) && payload.items.length > 0) {
            setLiveFeedItems(payload.items);
          }

          if (payload.portfolio) {
            setLivePortfolio(payload.portfolio);
          }

          if (Array.isArray(payload.companionItems) && payload.companionItems.length > 0) {
            setLiveCompanionItems(payload.companionItems);
          }

          if (payload.systemClockLabel) {
            setLiveClockLabel(payload.systemClockLabel);
          }
        });
      } catch {
        // Demo mode keeps the previous successful scene when polling fails.
      }
    }

    void refresh();
    const timer = window.setInterval(refresh, refreshMs);

    return () => {
      disposed = true;
      window.clearInterval(timer);
    };
  }, [endpoint, refreshMs]);

  return {
    liveFiles,
    liveFeedItems,
    livePortfolio,
    liveCompanionItems,
    liveClockLabel,
  };
}

function HeaderButton({
  href,
  children,
  tone = "default",
}: {
  href: string;
  children: ReactNode;
  tone?: "default" | "blue";
}) {
  return (
    <Link
      className={`hud-strip__button ${
        tone === "blue" ? "hud-strip__button--blue" : ""
      }`}
      href={href}
    >
      {children}
    </Link>
  );
}

export function HomeScreen({
  profile,
  feedItems,
  files,
  portfolio,
  companionItems,
  systemClockLabel,
  refreshMs,
}: HomeScreenProps) {
  const initialCompanionId = companions.some(
    (companion) => companion.id === profile.companionId,
  )
    ? profile.companionId
    : companions[0].id;

  const [activeCompanionId, setActiveCompanionId] = useState(initialCompanionId);
  const [sceneFrame, setSceneFrame] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSceneFrame((value) => value + 1);
    }, DEMO_ROTATE_MS);

    return () => window.clearInterval(timer);
  }, []);

  const companionHref = useMemo(
    () => buildCompanionHref(profile, activeCompanionId),
    [activeCompanionId, profile],
  );
  const marketHomeHref = useMemo(
    () => buildMarketHomeHref(profile, activeCompanionId, sceneFrame),
    [activeCompanionId, profile, sceneFrame],
  );
  const {
    liveFiles,
    liveFeedItems,
    livePortfolio,
    liveCompanionItems,
    liveClockLabel,
  } = useDemoMarketData(
    marketHomeHref,
    refreshMs,
    files,
    feedItems,
    portfolio,
    companionItems,
    systemClockLabel,
  );

  const activeCompanionIndex = companions.findIndex(
    (companion) => companion.id === activeCompanionId,
  );
  const activeCompanion = getCompanionById(activeCompanionId);
  const behaviorState = useMemo(
    () => resolveBehaviorState(activeCompanion, Math.max(activeCompanionIndex, 0) + sceneFrame),
    [activeCompanion, activeCompanionIndex, sceneFrame],
  );
  const footerNotes = useMemo(
    () =>
      liveFeedItems.slice(0, 2).map((item) => ({
        id: item.id,
        label: item.headlineTag ?? item.symbol,
        text: item.summary,
      })),
    [liveFeedItems],
  );

  return (
    <main className="screen-shell screen-shell--home text-stone-950">
      <div className="screen-frame">
        <header className="hud-strip">
          <div className="hud-strip__time">{liveClockLabel}</div>

          <div className="hud-strip__title">{marketSummary.headlineBanner}</div>

          <div className="hud-strip__actions">
            <HeaderButton href="/onboarding" tone="blue">
              预设档案
            </HeaderButton>
            <HeaderButton href={companionHref}>角色详情</HeaderButton>
          </div>
        </header>

        <section className="home-hud">
          <InfoFeedPanel
            feedItems={liveFeedItems}
            files={liveFiles}
            footerNotes={footerNotes}
            systemClockLabel={liveClockLabel}
          />

          <MarketDisplayPanel portfolio={livePortfolio} />

          <CompanionPanel
            activeCompanionId={activeCompanionId}
            behaviorState={behaviorState}
            companion={activeCompanion}
            companions={companions}
            feedItems={liveCompanionItems}
            onSelectCompanion={setActiveCompanionId}
          />
        </section>
      </div>
    </main>
  );
}
