import {
  getCompanionById,
  type FeedItem,
  type PortfolioSnapshot,
  type UserProfile,
} from "@/lib/mock-data";
import type { NormalizedNewsItem } from "@/lib/news-normalizer";
import { getLeadNews, rankNewsItems } from "@/lib/news-ranker";

function buildLineByCompanion(
  companionId: string,
  item: NormalizedNewsItem,
  profile: UserProfile,
  portfolio: PortfolioSnapshot,
) {
  const focus = portfolio.focusTicker;

  if (companionId === "code-bro") {
    return `${item.symbol} 正在承接 ${item.headlineTag}，${
      item.eventType === "risk" ? "先看回撤是否收敛" : `当前结构仍偏向 ${item.sector}`
    }。${focus === item.symbol ? "它还是主屏焦点。" : `${focus} 仍是主屏锚点。`}`;
  }

  if (companionId === "fomo-trader") {
    return `${item.symbol} 这条真的有戏，${item.headlineTag} 一出来聊天室就会热。${
      item.eventType === "risk"
        ? "但今天追的人一多，回撤也会很快。"
        : `${item.sector} 这波很容易继续带节奏。`
    }`;
  }

  return `${item.symbol} 先别急着追，${item.headlineTag} 更像是给 ${item.sector} 补了一次观察理由。${
    item.eventType === "risk"
      ? "这类提醒更多是让我们先看承接。"
      : profile.holdings.includes(item.symbol)
        ? "它还在你的观察池里，可以继续盯。"
        : "先等下一次承接确认。"
  }`;
}

export function buildCompanionItemsFromNews({
  profile,
  companionId,
  items,
  portfolio,
}: {
  profile: UserProfile;
  companionId: string;
  items: NormalizedNewsItem[];
  portfolio: PortfolioSnapshot;
}): FeedItem[] {
  const companion = getCompanionById(companionId);
  const ranked = rankNewsItems(items, profile).slice(0, 3);
  const lead = getLeadNews(items, profile);

  return ranked.map((item, index) => ({
    id: `${companion.id}-${item.id}-${index + 1}`,
    companionId: companion.id,
    content:
      index === 0 && lead
        ? buildLineByCompanion(companion.id, lead, profile, portfolio)
        : buildLineByCompanion(companion.id, item, profile, portfolio),
    toneTag: ["最新", "跟踪", "提醒"][index] ?? "播报",
    createdAt: ["09:48", "10:26", "11:42"][index] ?? "12:06",
    boardTone: item.boardTone,
  }));
}
