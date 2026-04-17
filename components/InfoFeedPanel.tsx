import { PixelWindow } from "@/components/PixelWindow";
import type { MarketFeedItem } from "@/lib/market-feed";

type FooterNote = {
  id: string;
  label: string;
  text: string;
};

type InfoFeedPanelProps = {
  systemClockLabel: string;
  files: string[];
  feedItems: MarketFeedItem[];
  footerNotes: FooterNote[];
};

const sentimentLabel = {
  bullish: "热",
  neutral: "平",
  risk: "险",
} as const;

export function InfoFeedPanel({
  systemClockLabel,
  files,
  feedItems,
  footerNotes,
}: InfoFeedPanelProps) {
  const loopItems = [...feedItems, ...feedItems];

  return (
    <PixelWindow
      bodyClassName="pixel-window__body--dense"
      className="pixel-window--tall"
      label="市场消息"
      title="信息流"
    >
      <div className="feed-panel">
        <div className="feed-panel__meta">
          <p className="feed-panel__clock-label">当前时间</p>
          <p className="feed-panel__clock">{systemClockLabel}</p>

          <div className="feed-panel__files">
            {files.map((file) => (
              <div key={file} className="feed-panel__file-row">
                <span className="feed-panel__file-icon">档</span>
                <span>{file}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="feed-marquee">
          <div className="feed-marquee__track">
            {loopItems.map((item, index) => (
              <article
                key={`${item.id}-${index}`}
                className={`feed-marquee__item ${
                  item.boardTone ? `feed-marquee__item--${item.boardTone}` : ""
                }`}
              >
                <div className="feed-marquee__top">
                  <div className="feed-marquee__ticker-row">
                    <span className="feed-marquee__ticker">{item.symbol}</span>
                    <span className={`feed-sentiment feed-sentiment--${item.sentiment}`}>
                      {sentimentLabel[item.sentiment]}
                    </span>
                    {item.headlineTag ? (
                      <span className="feed-panel__footer-tag">{item.headlineTag}</span>
                    ) : null}
                  </div>
                  <span className="feed-marquee__time pixel-mono">{item.timestamp}</span>
                </div>

                <p className="feed-marquee__title">{item.title}</p>
                <p className="feed-marquee__summary">{item.summary}</p>
                <p className="feed-marquee__source">来源: {item.source}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="feed-panel__footer">
          <div className="feed-panel__footer-title">市场补充</div>

          <div className="feed-panel__footer-list">
            {footerNotes.map((note) => (
              <article key={note.id} className="feed-panel__footer-item">
                <span className="feed-panel__footer-tag">{note.label}</span>
                <p>{note.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </PixelWindow>
  );
}
