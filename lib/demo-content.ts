import {
  defaultProfile,
  getCompanionById,
  type FeedItem,
  type PortfolioHolding,
  type PortfolioSnapshot,
  type UserProfile,
} from "@/lib/mock-data";
import type { MarketFeedItem } from "@/lib/market-feed";
import type { QuotePoint } from "@/lib/quote-provider";

export const DEMO_ROTATE_MS = 24_000;

export type DemoHomePayload = {
  scenarioId: string;
  systemClockLabel: string;
  files: string[];
  items: MarketFeedItem[];
  portfolio: PortfolioSnapshot;
  companionItems: FeedItem[];
  source: {
    feed: "mock";
    snapshot: "mock";
    companion: "mock";
    quote: "mock";
  };
};

type ScenarioKey = "ai-infra" | "earnings-watch" | "rotation-day" | "risk-off";

type ScenarioConfig = {
  id: ScenarioKey;
  clockLabel: string;
  files: string[];
  availableLabel: string;
  focusLabel: string;
  indexLabel: string;
  postureLabel: string;
  noteLabel: string;
  changes: [number, number, number];
  breadth: [number, number, number, number];
  chart: Array<{
    label: string;
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
  }>;
  timeline: {
    one: string;
    two: string;
    three: string;
  };
  buildFeed: (profile: UserProfile) => MarketFeedItem[];
  buildCompanionLines: (profile: UserProfile) => Record<string, string[]>;
};

const companyNames: Record<string, string> = {
  AAPL: "苹果",
  AMD: "AMD",
  DIA: "道指 ETF",
  META: "Meta",
  MSFT: "微软",
  NVDA: "英伟达",
  QQQ: "纳指 ETF",
  SPY: "标普 ETF",
  TSLA: "特斯拉",
};

const scenarioConfigs: ScenarioConfig[] = [
  {
    id: "ai-infra",
    clockLabel: "2026/04/07 周二 · 09:42",
    files: [
      "ai-infra-brief.json",
      "mega-cap-watch.json",
      "pre-market-flow.json",
      "board-rotation.json",
    ],
    availableLabel: "注意力可用 84%",
    focusLabel: "AI 基建继续领跑",
    indexLabel: "科技偏强",
    postureLabel: "热点延续",
    noteLabel: "AI 基建热度延续，市场还在围绕资本开支和大票承接交易。",
    changes: [1.8, 1.1, 3.6],
    breadth: [86, 68, 92, 54],
    chart: [
      { label: "09:30", open: 36, close: 44, high: 49, low: 33, volume: 41 },
      { label: "09:55", open: 44, close: 40, high: 47, low: 37, volume: 33 },
      { label: "10:20", open: 40, close: 56, high: 60, low: 38, volume: 58 },
      { label: "10:45", open: 56, close: 52, high: 62, low: 49, volume: 47 },
      { label: "11:10", open: 52, close: 67, high: 72, low: 50, volume: 68 },
      { label: "11:35", open: 67, close: 63, high: 73, low: 59, volume: 56 },
      { label: "12:00", open: 63, close: 74, high: 80, low: 61, volume: 75 },
    ],
    timeline: {
      one: "主线延续",
      two: "资金回到大票",
      three: "弹性标的再被点名",
    },
    buildFeed(profile) {
      const [a, b, c] = profile.holdings;
      const [sectorA, sectorB] = profile.sectors;
      return [
        createFeed("ai-1", a, "AI 订单延续，服务器链再被点名", "卖方把关注点放在资本开支和交付节奏，盘前最热的是 AI 基建还能不能继续接力。", "09:06", "财报前瞻", "财联监测", "bullish", 94, "ai"),
        createFeed("ai-2", b, "企业客户续签回暖，软件预算开始回流", `${sectorB} 方向出现增量讨论，市场开始把 ${b} 当成这条线的稳定锚。`, "09:14", "预算回流", "路透摘要", "bullish", 89, "cloud"),
        createFeed("ai-3", c, "算力链热度回升，弹性标的重新回到前排", `${c} 再次进入成交和热榜前列，情绪资金更愿意回到高弹性环节。`, "09:23", "成交放量", "市场情绪", "bullish", 97, "semis"),
        createFeed("ai-4", "QQQ", "纳指权重走强，成长风格继续占优", "指数层面没有新方向，但资金继续偏向科技权重，成长风格相对更稳。", "09:31", "指数强弱", "指数播报", "bullish", 82, "index"),
        createFeed("ai-5", a, `${sectorA} 继续站在主舞台`, `${a} 和 ${c} 把板块热度重新抬高，市场还在交易这条主线的延续性。`, "09:38", "板块接力", "热点梳理", "bullish", 86, "ai"),
        createFeed("ai-6", "SPY", "大盘震荡开局，强势叙事仍集中在科技", "指数没有明显扩散，资金更愿意留在有故事、有承接的大票链条里。", "09:46", "大盘节奏", "盘前总览", "neutral", 74, "index"),
      ];
    },
    buildCompanionLines(profile) {
      const [a, b, c] = profile.holdings;
      const [sectorA, sectorB] = profile.sectors;
      return {
        "lao-wang": [
          `${a} 这条利好先别只看标题，要看它能不能继续带着 ${sectorA} 放量走。`,
          `${c} 热度最高，但它更像情绪放大器，回落后的承接才是重点。`,
          `${b} 和 ${sectorB} 这条线现在更像稳住节奏的那只手。`,
        ],
        "code-bro": [
          `当前主线还是 ${sectorA}。${a} 负责叙事，${b} 负责验证。`,
          `${c} 动量最强，但它是高 beta 跟随，不是全天候核心。`,
          `只要 QQQ 继续强于大盘，这组排序就没有坏。`,
        ],
        "fomo-trader": [
          `${c} 今天还是最会被聊的那只，弹幕味已经拉满了。`,
          `${sectorA} 又回到前排，${a} 这条线就是流量中心。`,
          `${b} 比较低调，但它要是一抬头，这波气氛会更热。`,
        ],
      };
    },
  },
  {
    id: "earnings-watch",
    clockLabel: "2026/04/07 周二 · 10:18",
    files: [
      "earnings-calendar.json",
      "guidance-checklist.json",
      "estimate-drift.json",
      "macro-headlines.json",
    ],
    availableLabel: "财报预期升温",
    focusLabel: "科技财报前夕观察区",
    indexLabel: "等待验证",
    postureLabel: "先看财报预期",
    noteLabel: "市场重心转到业绩和指引，追热点的容错率下降。",
    changes: [0.9, 2.1, 1.4],
    breadth: [72, 84, 66, 48],
    chart: [
      { label: "09:30", open: 42, close: 40, high: 45, low: 36, volume: 34 },
      { label: "09:55", open: 40, close: 47, high: 51, low: 38, volume: 39 },
      { label: "10:20", open: 47, close: 44, high: 50, low: 41, volume: 35 },
      { label: "10:45", open: 44, close: 58, high: 61, low: 42, volume: 55 },
      { label: "11:10", open: 58, close: 61, high: 66, low: 55, volume: 52 },
      { label: "11:35", open: 61, close: 59, high: 64, low: 57, volume: 44 },
      { label: "12:00", open: 59, close: 65, high: 69, low: 58, volume: 58 },
    ],
    timeline: {
      one: "财报前夕",
      two: "指引预期升温",
      three: "估值开始重新定价",
    },
    buildFeed(profile) {
      const [a, b, c] = profile.holdings;
      const [sectorA, sectorB] = profile.sectors;
      return [
        createFeed("earn-1", a, "财报前夕预期升温，关注产品线和回购节奏", `${a} 的讨论焦点转向收入结构和管理层口径，市场想先看预期会不会抬高。`, "10:02", "财报前瞻", "预期管理", "neutral", 90, "ai"),
        createFeed("earn-2", b, "企业客户支出回暖，指引修正预期走高", `${sectorB} 的情绪比早盘更稳，${b} 被当成这轮财报线里的确定性样本。`, "10:11", "指引修正", "机构摘要", "bullish", 93, "cloud"),
        createFeed("earn-3", c, "高估值弹性股仍热，但资金开始计较兑现空间", `${c} 还在榜上，但交易从“追热”切到“算预期差”，波动会更大。`, "10:19", "估值博弈", "热榜追踪", "neutral", 88, "semis"),
        createFeed("earn-4", "QQQ", "纳指走势平稳，等待业绩线给出下一拍", "指数没有明显加速，盘面更多是在给财报线腾出观察空间。", "10:28", "指数等待", "盘中快照", "neutral", 75, "index"),
        createFeed("earn-5", a, `${sectorA} 里最会被问的还是兑现问题`, `市场已经不满足于“故事还在”，更想看到 ${a} 和 ${c} 的兑现速度。`, "10:36", "兑现节奏", "主题复盘", "risk", 79, "risk"),
        createFeed("earn-6", "SPY", "大盘波动不大，资金继续在科技里做筛选", "指数层面不急着给方向，市场把注意力留给下一批业绩和指引。", "10:44", "风格筛选", "指数播报", "neutral", 70, "index"),
      ];
    },
    buildCompanionLines(profile) {
      const [a, b, c] = profile.holdings;
      return {
        "lao-wang": [
          `${a} 现在最怕的是预期打太满，财报前别只看热度。`,
          `${b} 这条线相对更稳，适合拿来观察资金是不是开始收口到确定性。`,
          `${c} 还会很热，但财报线里越热的票，波动往往越大。`,
        ],
        "code-bro": [
          `这轮交易的核心是“预期差”。${b} 的确定性高于 ${c}。`,
          `${a} 适合盯管理层口径，${c} 适合盯估值是否继续扩张。`,
          `指数没动太多，说明资金还在等财报给下一拍。`,
        ],
        "fomo-trader": [
          `${c} 还是自带讨论度，但现在全场都在等谁能把财报故事讲圆。`,
          `${a} 这条线要是有一点超预期，聊天室会瞬间炸掉。`,
          `${b} 虽然不最吵，但一旦指引上修，热度会追上来。`,
        ],
      };
    },
  },
  {
    id: "rotation-day",
    clockLabel: "2026/04/07 周二 · 11:07",
    files: [
      "sector-rotation-map.json",
      "flow-switch.json",
      "breadth-scan.json",
      "relative-strength.json",
    ],
    availableLabel: "风格切换加快",
    focusLabel: "板块轮动日",
    indexLabel: "轮动加快",
    postureLabel: "高低切进行中",
    noteLabel: "盘面不是没机会，而是接力速度变快，跟错一拍就容易空转。",
    changes: [-0.4, 1.6, 2.3],
    breadth: [58, 76, 81, 61],
    chart: [
      { label: "09:30", open: 48, close: 43, high: 52, low: 40, volume: 37 },
      { label: "09:55", open: 43, close: 50, high: 54, low: 41, volume: 42 },
      { label: "10:20", open: 50, close: 45, high: 53, low: 42, volume: 40 },
      { label: "10:45", open: 45, close: 58, high: 62, low: 44, volume: 57 },
      { label: "11:10", open: 58, close: 55, high: 61, low: 51, volume: 46 },
      { label: "11:35", open: 55, close: 63, high: 68, low: 53, volume: 59 },
      { label: "12:00", open: 63, close: 60, high: 66, low: 57, volume: 51 },
    ],
    timeline: {
      one: "高低切",
      two: "主线扩散",
      three: "资金找新锚点",
    },
    buildFeed(profile) {
      const [a, b, c] = profile.holdings;
      const [sectorA, sectorB] = profile.sectors;
      return [
        createFeed("rot-1", a, "早盘冲高后回落，资金开始从大票里做高低切", `${a} 还在热榜里，但盘中更明显的动作是资金分流到新弹性方向。`, "10:55", "高低切", "盘口监测", "risk", 87, "risk"),
        createFeed("rot-2", b, "企业软件接力更稳，低波动资产承接变好", `${b} 这类稳节奏标的开始被重新捞起来，${sectorB} 的排序往前走了一格。`, "11:02", "承接改善", "资金流向", "bullish", 92, "cloud"),
        createFeed("rot-3", c, "高弹性标的继续有戏，但不再一家独大", `${c} 还是有人看，但市场已经开始找第二批能接棒的名字。`, "11:10", "接力扩散", "热度扫描", "bullish", 84, "semis"),
        createFeed("rot-4", "SPY", "指数不弱，但盘中的主角正在轮换", "大盘没有坏，真正的变化在于热点不再只集中在一个角落。", "11:18", "风格轮换", "指数快照", "neutral", 73, "index"),
        createFeed("rot-5", a, `${sectorA} 热度仍在，只是赚钱效应开始分流`, `资金没有离场，只是从最核心的大票扩散到次核心和补涨方向。`, "11:25", "补涨轮动", "主题复盘", "neutral", 80, "ai"),
        createFeed("rot-6", "QQQ", "成长风格维持强势，但追高容错率下降", "指数层面依旧偏强，只是前排票的分歧比早盘更大。", "11:34", "分歧加大", "盘中播报", "risk", 77, "risk"),
      ];
    },
    buildCompanionLines(profile) {
      const [a, b, c] = profile.holdings;
      const [sectorA, sectorB] = profile.sectors;
      return {
        "lao-wang": [
          `${a} 这会儿更像旧热点里的高位股，别忽略分歧在放大。`,
          `${b} 和 ${sectorB} 这边承接更稳，适合拿来观察资金有没有换挡。`,
          `${sectorA} 还没结束，只是从单点爆发转成轮着接力。`,
        ],
        "code-bro": [
          `盘面从单核心切到双核心。${a} 退到叙事层，${b} 上到承接层。`,
          `${c} 仍有动量，但赚钱效应已经开始扩散，不宜只盯一个标的。`,
          `现在最重要的是分辨谁是补涨，谁是新主线。`,
        ],
        "fomo-trader": [
          `${c} 还在热榜，但今天最有意思的是新名字开始冒头。`,
          `${b} 这种本来不吵的票，突然被捞起来就很有戏。`,
          `${sectorA} 还没散，只是全场开始抢第二波流量入口。`,
        ],
      };
    },
  },
  {
    id: "risk-off",
    clockLabel: "2026/04/07 周二 · 12:26",
    files: [
      "risk-monitor.json",
      "macro-warning.json",
      "defensive-rotation.json",
      "volatility-check.json",
    ],
    availableLabel: "风险偏好回落",
    focusLabel: "先看防守和承接",
    indexLabel: "大盘偏弱",
    postureLabel: "先收缩节奏",
    noteLabel: "风险偏好下降时，叙事还在并不代表立刻能走出新高。",
    changes: [-1.1, 0.3, -0.6],
    breadth: [41, 58, 47, 34],
    chart: [
      { label: "09:30", open: 52, close: 46, high: 55, low: 44, volume: 43 },
      { label: "09:55", open: 46, close: 49, high: 51, low: 42, volume: 36 },
      { label: "10:20", open: 49, close: 41, high: 50, low: 38, volume: 52 },
      { label: "10:45", open: 41, close: 45, high: 48, low: 39, volume: 39 },
      { label: "11:10", open: 45, close: 37, high: 46, low: 34, volume: 61 },
      { label: "11:35", open: 37, close: 39, high: 42, low: 35, volume: 40 },
      { label: "12:00", open: 39, close: 33, high: 40, low: 30, volume: 68 },
    ],
    timeline: {
      one: "风险偏好回落",
      two: "高位分歧扩大",
      three: "资金先看防守",
    },
    buildFeed(profile) {
      const [a, b, c] = profile.holdings;
      const [sectorA, sectorB] = profile.sectors;
      return [
        createFeed("risk-1", a, "高位科技股分歧扩大，追价意愿明显下降", `${a} 相关消息还在，但盘面开始更在意兑现和回撤幅度。`, "12:02", "高位分歧", "风险雷达", "risk", 90, "risk"),
        createFeed("risk-2", b, "防守型软件票相对抗跌，资金先找稳的停靠点", `${b} 和 ${sectorB} 成了留在场内的过渡区，强在不乱而不是突然爆发。`, "12:09", "防守承接", "风格跟踪", "neutral", 86, "cloud"),
        createFeed("risk-3", c, "高弹性链条波动放大，情绪票回撤更快", `${c} 仍有讨论，但盘口已经从“抢”变成了“怕回撤”。`, "12:16", "波动放大", "情绪监测", "risk", 93, "semis"),
        createFeed("risk-4", "SPY", "指数回落，市场先处理高位分歧", "今天更像资金主动降速，而不是主动开启新一轮冲锋。", "12:22", "指数回落", "指数快讯", "risk", 79, "index"),
        createFeed("risk-5", a, `${sectorA} 暂时没有失效，但交易难度明显上升`, "主线故事还在，只是每一次冲高后的兑现速度都变快了。", "12:30", "难度提升", "主题提醒", "risk", 83, "risk"),
        createFeed("risk-6", "DIA", "资金偏向防守，低波动资产相对更受欢迎", "风格开始往低波动和稳定现金流靠，激进追高的容错率下降。", "12:38", "防守偏好", "风格播报", "neutral", 71, "index"),
      ];
    },
    buildCompanionLines(profile) {
      const [a, b, c] = profile.holdings;
      return {
        "lao-wang": [
          `${a} 这会儿最怕的是高位分歧继续放大，先别把每次反抽都当新机会。`,
          `${b} 现在更像情绪缓冲区，盘面弱的时候稳住它更重要。`,
          `${c} 还是会有人抢，但风险偏好一降，回撤会来得更快。`,
        ],
        "code-bro": [
          `当前关键词不是“新主线”，而是“谁能抗跌”。`,
          `${b} 的防守属性高于 ${a} 和 ${c}，这就是今天的结构差异。`,
          `指数走弱时，先看承接和波动收缩，不要先看故事大小。`,
        ],
        "fomo-trader": [
          `今天聊天室明显冷下来了，${c} 这种票一冲一回最容易劝退人。`,
          `${a} 还在被讨论，但情绪已经不愿意继续给溢价。`,
          `${b} 这种不刺激的票反而成了大家躲波动的地方。`,
        ],
      };
    },
  },
];

function getCompanyName(symbol: string) {
  return companyNames[symbol] ?? symbol;
}

function toBias(change: number): PortfolioHolding["bias"] {
  if (change >= 1.5) {
    return "strong";
  }

  if (change <= -0.6) {
    return "weak";
  }

  return "neutral";
}

function formatChange(change: number) {
  return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
}

function createFeed(
  id: string,
  symbol: string,
  title: string,
  summary: string,
  timestamp: string,
  headlineTag: string,
  source: string,
  sentiment: MarketFeedItem["sentiment"],
  relevanceScore: number,
  boardTone: MarketFeedItem["boardTone"],
): MarketFeedItem {
  return {
    id,
    symbol,
    title: `${getCompanyName(symbol)}：${title}`,
    summary,
    timestamp,
    source,
    sentiment,
    headlineTag,
    relevanceScore,
    boardTone,
  };
}

function getScenario(frame = 0) {
  return scenarioConfigs[((frame % scenarioConfigs.length) + scenarioConfigs.length) % scenarioConfigs.length];
}

export function getDemoQuotePoints(
  profile: UserProfile = defaultProfile,
  frame = 0,
): QuotePoint[] {
  const scenario = getScenario(frame);
  const basePrices = [192.4, 418.2, 903.5];
  const indexSymbols = ["SPY", "QQQ", "DIA"];

  const holdingQuotes = profile.holdings.map((symbol, index) => {
    const changePercent = scenario.changes[index] ?? 0;
    const basePrice = basePrices[index] ?? 120;
    const price = Number((basePrice * (1 + changePercent / 100)).toFixed(2));

    return {
      symbol,
      price,
      change: Number((basePrice * (changePercent / 100)).toFixed(2)),
      changePercent,
      timestamp: scenario.clockLabel.split("·")[1]?.trim() ?? "12:00",
    };
  });

  const indexQuotes = indexSymbols.map((symbol, index) => {
    const drift = scenario.breadth[index] / 60 - 1;
    const changePercent = Number((drift * 0.9).toFixed(2));
    const basePrice = [517.8, 442.6, 392.2][index];

    return {
      symbol,
      price: Number((basePrice * (1 + changePercent / 100)).toFixed(2)),
      change: Number((basePrice * (changePercent / 100)).toFixed(2)),
      changePercent,
      timestamp: scenario.clockLabel.split("·")[1]?.trim() ?? "12:00",
    };
  });

  return [...holdingQuotes, ...indexQuotes];
}

export function getDemoFeedItems(
  profile: UserProfile = defaultProfile,
  frame = 0,
) {
  return getScenario(frame).buildFeed(profile);
}

export function getDemoCompanionItems({
  profile = defaultProfile,
  companionId = profile.companionId,
  frame = 0,
}: {
  profile?: UserProfile;
  companionId?: string;
  frame?: number;
}) {
  const scenario = getScenario(frame);
  const companion = getCompanionById(companionId);
  const lines =
    scenario.buildCompanionLines(profile)[companion.id] ??
    scenario.buildCompanionLines(profile)["lao-wang"];
  const toneTags = ["最新", "跟踪", "提醒"];
  const times = ["09:48", "10:26", "11:42"];

  return lines.map((content, index) => ({
    id: `${scenario.id}-${companion.id}-${index + 1}`,
    companionId: companion.id,
    content,
    toneTag: toneTags[index] ?? "播报",
    createdAt: times[index] ?? "12:06",
    boardTone: (["ai", "cloud", "semis"][index] ?? "index") as FeedItem["boardTone"],
  }));
}

export function getDemoPortfolioSnapshot({
  profile = defaultProfile,
  frame = 0,
  quotes = getDemoQuotePoints(profile, frame),
}: {
  profile?: UserProfile;
  frame?: number;
  quotes?: QuotePoint[];
} = {}): PortfolioSnapshot {
  const scenario = getScenario(frame);
  const quoteMap = new Map(quotes.map((quote) => [quote.symbol, quote]));
  const weights = [42, 33, 25];
  const holdings = profile.holdings.map((ticker, index) => {
    const quote = quoteMap.get(ticker);
    const change = quote?.changePercent ?? scenario.changes[index] ?? 0;

    return {
      ticker,
      weight: weights[index] ?? 20,
      change,
      bias: toBias(change),
    };
  });
  const dailyPnl = Number(
    holdings.reduce((sum, item) => sum + item.change * (item.weight / 100), 0).toFixed(2),
  );
  const focusHolding =
    [...holdings].sort((a, b) => b.change - a.change)[0] ?? holdings[0];
  const [sectorA, sectorB] = profile.sectors;

  return {
    holdings,
    dailyPnl,
    signal: dailyPnl > 1.5 ? "strong" : dailyPnl < -0.5 ? "weak" : "neutral",
    focusTicker: focusHolding?.ticker ?? profile.holdings[0] ?? "AAPL",
    postureLabel: scenario.postureLabel,
    activityLog: [
      {
        id: `${scenario.id}-log-1`,
        time: "09:32",
        action: "主线提取",
        detail: `${scenario.timeline.one}，${sectorA} 仍是最值得先看的方向。`,
      },
      {
        id: `${scenario.id}-log-2`,
        time: "10:24",
        action: "焦点切换",
        detail: `${focusHolding?.ticker ?? "AAPL"} 当前最亮，${scenario.timeline.two}。`,
      },
      {
        id: `${scenario.id}-log-3`,
        time: "11:38",
        action: "节奏备注",
        detail: `${sectorB ?? "云软件"} 作为第二观察窗口，${scenario.timeline.three}。`,
      },
    ],
    chartSeries: scenario.chart,
    breadthSeries: [
      { label: sectorA ?? "AI 基建", value: scenario.breadth[0] },
      { label: sectorB ?? "云软件", value: scenario.breadth[1] },
      { label: "半导体", value: scenario.breadth[2] },
      { label: "大盘", value: scenario.breadth[3] },
    ],
    watchTable: holdings.map((holding, index) => ({
      ticker: holding.ticker,
      name: ["主屏焦点", "节奏锚点", "情绪热点"][index] ?? "观察对象",
      board:
        index === 0
          ? sectorA ?? "AI 基建"
          : index === 1
            ? sectorB ?? "云软件"
            : "半导体",
      change: formatChange(holding.change),
      heat: ["高", "中", "高"][index] ?? "中",
      state:
        holding.bias === "strong"
          ? "跟踪"
          : holding.bias === "weak"
            ? "谨慎"
            : "观察",
    })),
    marketSnapshot: {
      availableLabel: scenario.availableLabel,
      focusBoardLabel: scenario.focusLabel,
      noteLabel: scenario.noteLabel,
      indexLabel: scenario.indexLabel,
    },
  };
}

export function getDemoHomePayload({
  profile = defaultProfile,
  companionId = profile.companionId,
  frame = 0,
}: {
  profile?: UserProfile;
  companionId?: string;
  frame?: number;
} = {}): DemoHomePayload {
  const scenario = getScenario(frame);
  const items = getDemoFeedItems(profile, frame);
  const companionItems = getDemoCompanionItems({
    profile,
    companionId,
    frame,
  });
  const portfolio = getDemoPortfolioSnapshot({
    profile,
    frame,
    quotes: getDemoQuotePoints(profile, frame),
  });

  return {
    scenarioId: scenario.id,
    systemClockLabel: scenario.clockLabel,
    files: scenario.files,
    items,
    portfolio,
    companionItems,
    source: {
      feed: "mock",
      snapshot: "mock",
      companion: "mock",
      quote: "mock",
    },
  };
}
