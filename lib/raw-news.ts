import { getDemoFeedItems } from "@/lib/demo-content";
import { defaultProfile, type UserProfile } from "@/lib/mock-data";

export type RawNewsItem = {
  id: string;
  symbol: string;
  headline: string;
  body: string;
  source: string;
  publishedAt: string;
  sentimentHint: "bullish" | "neutral" | "risk";
  boardTone: "ai" | "cloud" | "semis" | "index" | "risk";
  topicHint?: string;
};

const bodyExpanders: Record<RawNewsItem["boardTone"], string[]> = {
  ai: [
    "机构更关心资本开支兑现和订单延续，而不是单日情绪波动。",
    "讨论焦点集中在训练集群、企业部署节奏和盈利兑现速度。",
  ],
  cloud: [
    "市场更愿意给稳定续约和企业 IT 预算修复更高权重。",
    "投资者把这类消息视作估值重新抬升的缓冲带。",
  ],
  semis: [
    "高弹性标的容易获得更高讨论度，但回撤也会更快放大。",
    "焦点更多落在景气延续、库存周期和成交放量的确认上。",
  ],
  index: [
    "指数层面没有新主线，但能反映市场风险偏好是否继续向成长聚集。",
    "这类消息更多服务于判断大盘环境，而不是单只股票结论。",
  ],
  risk: [
    "如果高位分歧继续扩大，市场会优先处理风险而不是继续追价。",
    "风险提示不会直接改写主线，但会改变资金出手的节奏。",
  ],
};

export function getDemoRawNews(
  profile: UserProfile = defaultProfile,
  frame = 0,
): RawNewsItem[] {
  const demoItems = getDemoFeedItems(profile, frame);

  return demoItems.map((item, index) => {
    const extraLine =
      bodyExpanders[item.boardTone ?? "index"][index % 2] ??
      bodyExpanders.index[0];

    return {
      id: `raw-${item.id}`,
      symbol: item.symbol,
      headline: item.title,
      body: `${item.summary} ${extraLine}`.trim(),
      source: item.source,
      publishedAt: item.timestamp,
      sentimentHint: item.sentiment,
      boardTone: item.boardTone ?? "index",
      topicHint: item.headlineTag,
    };
  });
}
