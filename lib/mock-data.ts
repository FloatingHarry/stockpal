export type SearchParams = {
  companion?: string | string[];
  holding?: string | string[];
  sector?: string | string[];
};

export type BehaviorState = {
  key: string;
  label: string;
  posture: string;
  bubble: string;
  statusTone: "calm" | "focus" | "hype";
  animation: "idle" | "scan" | "hype";
};

export type Companion = {
  id: string;
  name: string;
  displayNameZh: string;
  persona: string;
  stylePrompt: string;
  signature: string;
  badgeColor: string;
  roleLabelZh: string;
  strategyLabelZh: string;
  defaultMood: string;
  voiceLines: string[];
  sprite: string;
  spriteWidth: number;
  avatarPalette: {
    hair: string;
    skin: string;
    coat: string;
    accent: string;
  };
  behaviorStates: BehaviorState[];
  tickerMood: Record<string, string>;
};

export type UserProfile = {
  holdings: string[];
  sectors: string[];
  companionId: string;
};

export type FeedItem = {
  id: string;
  companionId: string;
  content: string;
  toneTag: string;
  createdAt: string;
  boardTone?: "ai" | "cloud" | "semis" | "index" | "risk";
};

export type PortfolioHolding = {
  ticker: string;
  weight: number;
  change: number;
  bias: "strong" | "weak" | "neutral";
};

export type WatchTableRow = {
  ticker: string;
  name: string;
  board: string;
  change: string;
  heat: string;
  state: string;
};

export type ChartPoint = {
  label: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
};

export type MarketSnapshot = {
  availableLabel: string;
  focusBoardLabel: string;
  noteLabel: string;
  indexLabel: string;
};

export type PortfolioSnapshot = {
  holdings: PortfolioHolding[];
  dailyPnl: number;
  signal: "strong" | "weak" | "neutral";
  focusTicker: string;
  postureLabel: string;
  activityLog: {
    id: string;
    time: string;
    action: string;
    detail: string;
  }[];
  chartSeries: ChartPoint[];
  breadthSeries: {
    label: string;
    value: number;
  }[];
  watchTable: WatchTableRow[];
  marketSnapshot: MarketSnapshot;
};

export const companions: Companion[] = [
  {
    id: "lao-wang",
    name: "Lao Wang",
    displayNameZh: "老王 / Lao Wang",
    persona:
      "稳、慢、先看风险。他会把吵闹的盘面翻译成能落地的观察点，不会追着情绪跑。",
    stylePrompt:
      "像一个有经验的前辈，短句、克制、提醒风险，但要点到具体股票和板块。",
    signature: "稳着看，不乱追",
    badgeColor: "#bddf9f",
    roleLabelZh: "稳健陪看员",
    strategyLabelZh: "先看热度能不能走成主线，再决定值不值得继续盯。",
    defaultMood: "盯盘中",
    voiceLines: [
      "热闹不等于结论，先看谁能留下来。",
      "我先把噪音压一压，再看真正接棒的是谁。",
      "盘面会晃，但你的节奏不用跟着一起晃。",
    ],
    sprite: "/sprites/oga/lao-wang.gif",
    spriteWidth: 126,
    avatarPalette: {
      hair: "#4e2918",
      skin: "#ffd8b2",
      coat: "#6b5244",
      accent: "#efe2bc",
    },
    behaviorStates: [
      {
        key: "steady",
        label: "待机",
        posture: "抱手站定，先看热度是不是虚火。",
        bubble: "先别急着追，我先帮你看谁是真的有承接。",
        statusTone: "calm",
        animation: "idle",
      },
      {
        key: "scan",
        label: "观察",
        posture: "往前探一步，开始扫今天的主线。",
        bubble: "热度还在，但先看量和承接，不急着下结论。",
        statusTone: "focus",
        animation: "scan",
      },
      {
        key: "alert",
        label: "提醒",
        posture: "侧身指向榜单，提醒别被弹幕带节奏。",
        bubble: "这段能看，但别把情绪直接当信号。",
        statusTone: "calm",
        animation: "scan",
      },
    ],
    tickerMood: {
      AAPL: "拿得住",
      MSFT: "看结构",
      NVDA: "热，但别冲",
    },
  },
  {
    id: "code-bro",
    name: "Code Bro",
    displayNameZh: "代码哥 / Code Bro",
    persona:
      "偏逻辑、讲结构、话很短。像把盘面拆成条件判断的分析搭子。",
    stylePrompt:
      "先讲信号，再讲原因。少情绪词，多结构词，像在写盘面注释。",
    signature: "先信号，后情绪",
    badgeColor: "#c7e8ff",
    roleLabelZh: "结构分析员",
    strategyLabelZh: "只跟强趋势、强叙事和相对强弱，默认过滤噪音。",
    defaultMood: "解码中",
    voiceLines: [
      "先看强弱，再看要不要解释。",
      "趋势没断，主线就还在屏幕中央。",
      "别把随机波动误判成新故事。",
    ],
    sprite: "/sprites/oga/code-bro.png",
    spriteWidth: 104,
    avatarPalette: {
      hair: "#232733",
      skin: "#ffd9b7",
      coat: "#4e678b",
      accent: "#d7edf9",
    },
    behaviorStates: [
      {
        key: "idle",
        label: "待机",
        posture: "手里夹着终端卡，等下一条有效信号。",
        bubble: "先看结构，再输出结论。",
        statusTone: "focus",
        animation: "idle",
      },
      {
        key: "scan",
        label: "扫描",
        posture: "逐条核对热度、强弱和排序。",
        bubble: "主线还在前排，排序没乱，信号连续。",
        statusTone: "focus",
        animation: "scan",
      },
      {
        key: "burst",
        label: "锁定",
        posture: "确认主线以后，立刻标出重点窗口。",
        bubble: "可以看，可以跟，但不要演成追高剧本。",
        statusTone: "hype",
        animation: "hype",
      },
    ],
    tickerMood: {
      AAPL: "等形态",
      MSFT: "趋势完整",
      NVDA: "动量强",
    },
  },
  {
    id: "fomo-trader",
    name: "FOMO Trader",
    displayNameZh: "发财哥 / FOMO Trader",
    persona:
      "情绪拉满、嘴上很热闹，总在追最响的故事，但每句都得贴住具体标的。",
    stylePrompt:
      "像短视频评论区最兴奋的那位朋友，但每句都要点名股票和板块。",
    signature: "热点冲浪中",
    badgeColor: "#ffcbcf",
    roleLabelZh: "情绪点火员",
    strategyLabelZh: "谁热看谁，谁炸看谁，先挤进最吵的房间。",
    defaultMood: "带气氛中",
    voiceLines: [
      "这波聊天室已经快炸了。",
      "你这几只票刚好踩在最会被讨论的故事线上。",
      "我不看冷清票，我只看全场最吵的角落。",
    ],
    sprite: "/sprites/oga/fomo-trader.gif",
    spriteWidth: 148,
    avatarPalette: {
      hair: "#693316",
      skin: "#ffd3a8",
      coat: "#ef5a46",
      accent: "#fff0bb",
    },
    behaviorStates: [
      {
        key: "bounce",
        label: "待机",
        posture: "原地晃着，等热点再冲一段。",
        bubble: "先别走，我感觉热度还会继续冒。",
        statusTone: "hype",
        animation: "idle",
      },
      {
        key: "watch",
        label: "盯盘",
        posture: "往前探半步，盯着消息滚屏。",
        bubble: "热点又动了，我先带你挤到前排去看看。",
        statusTone: "focus",
        animation: "scan",
      },
      {
        key: "hype",
        label: "上头",
        posture: "抬手喊话，准备把气氛直接拉满。",
        bubble: "这波太有戏了，今天的弹幕味已经出来了。",
        statusTone: "hype",
        animation: "hype",
      },
    ],
    tickerMood: {
      AAPL: "慢热回潮",
      MSFT: "闷声发力",
      NVDA: "火箭燃料",
    },
  },
];

export const companionMap = Object.fromEntries(
  companions.map((companion) => [companion.id, companion]),
) as Record<string, Companion>;

export const defaultProfile: UserProfile = {
  holdings: ["AAPL", "MSFT", "NVDA"],
  sectors: ["AI 基建", "云软件"],
  companionId: "lao-wang",
};

export const marketSummary = {
  headlineBanner: "StockPal 情报台",
  systemClockLabel: "2026/04/07 周二 · 12:15",
};

export function sanitizeList(
  value: string | string[] | undefined,
  limit: number,
  fallback: string[],
) {
  const values = (Array.isArray(value) ? value : [value])
    .flatMap((item) => (item ?? "").split(","))
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, limit);

  return values.length > 0 ? values : fallback;
}

export function getCompanionById(id: string) {
  return companionMap[id] ?? companions[0];
}

export function getProfileFromSearchParams(
  params: SearchParams,
): UserProfile | null {
  const holdings = sanitizeList(params.holding, 3, defaultProfile.holdings).map(
    (ticker) => ticker.toUpperCase(),
  );
  const sectors = sanitizeList(params.sector, 2, defaultProfile.sectors);
  const companionId = Array.isArray(params.companion)
    ? params.companion[0]
    : params.companion;

  if (!companionId && !params.holding && !params.sector) {
    return null;
  }

  return {
    holdings,
    sectors,
    companionId: getCompanionById(companionId ?? defaultProfile.companionId).id,
  };
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

export function buildPortfolioSnapshot(profile: UserProfile): PortfolioSnapshot {
  const changes = [1.9, 0.8, 3.1];
  const weights = [42, 33, 25];
  const holdings = profile.holdings.map((ticker, index) => ({
    ticker,
    weight: weights[index] ?? 20,
    change: changes[index] ?? 0.6,
    bias: toBias(changes[index] ?? 0.6),
  }));
  const dailyPnl = Number(
    holdings.reduce((sum, item) => sum + item.change * (item.weight / 100), 0).toFixed(2),
  );

  return {
    holdings,
    dailyPnl,
    signal: dailyPnl > 1.5 ? "strong" : dailyPnl < -0.5 ? "weak" : "neutral",
    focusTicker: holdings[2]?.ticker ?? holdings[0]?.ticker ?? "AAPL",
    postureLabel: dailyPnl > 1.5 ? "主线延续" : "先看承接",
    activityLog: [
      {
        id: "log-1",
        time: "09:18",
        action: "热点提取",
        detail: `${profile.sectors[0]} 仍在前排，市场讨论集中在景气延续。`,
      },
      {
        id: "log-2",
        time: "10:32",
        action: "情绪跟踪",
        detail: `${holdings[2]?.ticker ?? "NVDA"} 的弹性最强，但承接仍要看量。`,
      },
      {
        id: "log-3",
        time: "11:48",
        action: "节奏备注",
        detail: `${profile.sectors[1] ?? "云软件"} 跟随回暖，适合做第二观察窗口。`,
      },
    ],
    chartSeries: [
      { label: "09:30", open: 34, close: 43, high: 48, low: 30, volume: 36 },
      { label: "09:55", open: 43, close: 39, high: 46, low: 35, volume: 29 },
      { label: "10:20", open: 39, close: 54, high: 58, low: 37, volume: 55 },
      { label: "10:45", open: 54, close: 51, high: 61, low: 47, volume: 48 },
      { label: "11:10", open: 51, close: 63, high: 68, low: 49, volume: 64 },
      { label: "11:35", open: 63, close: 58, high: 69, low: 55, volume: 52 },
      { label: "12:00", open: 58, close: 71, high: 76, low: 56, volume: 71 },
    ],
    breadthSeries: [
      { label: "AI", value: 82 },
      { label: "云软件", value: 66 },
      { label: "半导体", value: 89 },
      { label: "大盘", value: 52 },
    ],
    watchTable: [
      {
        ticker: profile.holdings[0] ?? "AAPL",
        name: "主屏焦点",
        board: profile.sectors[0] ?? "AI 基建",
        change: "+1.9%",
        heat: "高",
        state: "跟踪",
      },
      {
        ticker: profile.holdings[1] ?? "MSFT",
        name: "节奏锚点",
        board: profile.sectors[1] ?? "云软件",
        change: "+0.8%",
        heat: "中",
        state: "观察",
      },
      {
        ticker: profile.holdings[2] ?? "NVDA",
        name: "情绪热点",
        board: "AI 基建",
        change: "+3.1%",
        heat: "极高",
        state: "热议",
      },
    ],
    marketSnapshot: {
      availableLabel: "注意力可用 82%",
      focusBoardLabel: `${profile.sectors[0] ?? "AI 基建"} 仍是一号观察区`,
      noteLabel: "当前为演示模式，图表、消息和角色评论都由本地场景库驱动。",
      indexLabel: "科技偏强",
    },
  };
}

export function buildFeedItems(profile: UserProfile, companion: Companion): FeedItem[] {
  const [a, b, c] = profile.holdings;
  const [sectorA] = profile.sectors;

  const lines: Record<string, string[]> = {
    "lao-wang": [
      `${a} 这条线先看承接，别把一句利好直接当成全天趋势。`,
      `${sectorA} 还在前排，但我更想看 ${b} 能不能把节奏接住。`,
      `${c} 热是热，先看量能和回落后的承接，再决定要不要继续追。`,
    ],
    "code-bro": [
      `${sectorA} 仍是主线。${a} 负责叙事，${b} 负责验证。`,
      `${c} 的弹性最大，但它更像高 beta 跟随，不是全天候核心。`,
      `只要成长风格排序不乱，当前盘面结构就没有坏。`,
    ],
    "fomo-trader": [
      `${c} 今天还是最会被讨论的那只，弹幕味已经出来了。`,
      `${sectorA} 又冲回前排，${a} 和 ${b} 这组真的很容易带节奏。`,
      `这盘不是没故事，是故事都挤在同一个热点房间里。`,
    ],
  };

  return (lines[companion.id] ?? lines["lao-wang"]).map((content, index) => ({
    id: `${companion.id}-${index + 1}`,
    companionId: companion.id,
    content,
    toneTag: ["快评", "板块", "提醒"][index] ?? "播报",
    createdAt: ["09:12", "10:28", "11:46"][index] ?? "12:10",
  }));
}

export function resolveBehaviorState(companion: Companion, activeIndex: number) {
  return companion.behaviorStates[activeIndex % companion.behaviorStates.length];
}

function buildSearchString(profile: UserProfile) {
  const params = new URLSearchParams();

  profile.holdings.forEach((holding) => params.append("holding", holding));
  profile.sectors.forEach((sector) => params.append("sector", sector));
  params.set("companion", profile.companionId);

  return params.toString();
}

export function buildCompanionPageHref(profile: UserProfile) {
  return `/companion?${buildSearchString(profile)}`;
}

export function buildHomeHref(profile: UserProfile) {
  return `/?${buildSearchString(profile)}`;
}
