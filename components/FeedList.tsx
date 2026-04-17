import type { FeedItem } from "@/lib/mock-data";

type FeedListProps = {
  feedItems: FeedItem[];
  compact?: boolean;
};

export function FeedList({ feedItems, compact = false }: FeedListProps) {
  return (
    <div className={compact ? "feed-list feed-list--compact" : "feed-list"}>
      {feedItems.map((item) => (
        <article
          key={item.id}
          className={`feed-list__item${item.boardTone ? ` feed-list__item--${item.boardTone}` : ""}`}
        >
          <div className="feed-list__top">
            <span
              className={`feed-list__tag${item.boardTone ? ` feed-list__tag--${item.boardTone}` : ""}`}
            >
              {item.toneTag}
            </span>
            <span className="feed-list__time pixel-mono">{item.createdAt}</span>
          </div>
          <p className="feed-list__content">{item.content}</p>
        </article>
      ))}
    </div>
  );
}
