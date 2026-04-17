"use client";

import { useEffect, useState } from "react";
import { CompanionSwitcher } from "@/components/CompanionSwitcher";
import { PixelAvatar } from "@/components/PixelAvatar";
import { PixelWindow } from "@/components/PixelWindow";
import type { BehaviorState, Companion, FeedItem } from "@/lib/mock-data";

type CompanionPanelProps = {
  companions: Companion[];
  activeCompanionId: string;
  companion: Companion;
  behaviorState: BehaviorState;
  feedItems: FeedItem[];
  onSelectCompanion: (id: string) => void;
};

function CompanionChatStream({
  behaviorState,
  feedItems,
}: {
  behaviorState: BehaviorState;
  feedItems: FeedItem[];
}) {
  const stagedFeedItems = feedItems.slice(0, 4);
  const [visibleCount, setVisibleCount] = useState(stagedFeedItems.length > 0 ? 1 : 0);

  useEffect(() => {
    if (stagedFeedItems.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setVisibleCount((count) => {
        if (count >= stagedFeedItems.length) {
          window.clearInterval(timer);
          return count;
        }

        return count + 1;
      });
    }, 4000);

    return () => window.clearInterval(timer);
  }, [stagedFeedItems]);

  const visibleItems = stagedFeedItems.slice(0, visibleCount);
  const hasPendingBubble = visibleCount < stagedFeedItems.length;

  return (
    <div className="chat-shell">
      <div className="chat-shell__header">
        <span>实时对话</span>
        <span className="pixel-mono">{behaviorState.label}</span>
      </div>

      <div className="chat-shell__list">
        {visibleItems.map((item, index) => (
          <article
            key={item.id}
            className={`chat-bubble${item.boardTone ? ` chat-bubble--${item.boardTone}` : ""}${
              index === visibleItems.length - 1 ? " chat-bubble--latest" : ""
            }`}
          >
            <div className="chat-bubble__meta">
              <span
                className={`chat-bubble__tag${
                  item.boardTone ? ` chat-bubble__tag--${item.boardTone}` : ""
                }`}
              >
                {index === visibleItems.length - 1 ? behaviorState.label : item.toneTag}
              </span>
              <span className="pixel-mono">{item.createdAt}</span>
            </div>
            <p>{item.content}</p>
          </article>
        ))}

        {hasPendingBubble ? (
          <div className="chat-shell__typing">
            <span className="chat-shell__typing-dot" />
            <span className="chat-shell__typing-dot" />
            <span className="chat-shell__typing-dot" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function CompanionPanel({
  companions,
  activeCompanionId,
  companion,
  behaviorState,
  feedItems,
  onSelectCompanion,
}: CompanionPanelProps) {
  const chatKey = `${activeCompanionId}-${feedItems.map((item) => item.id).join("-")}`;

  return (
    <PixelWindow
      bodyClassName="pixel-window__body--dense"
      className="pixel-window--tall"
      label="角色窗口"
      title={companion.displayNameZh}
    >
      <div className="companion-panel">
        <CompanionSwitcher
          companions={companions}
          activeId={activeCompanionId}
          onSelect={onSelectCompanion}
        />

        <div className="companion-panel__profile">
          <div className="companion-panel__row">
            <span>昵称</span>
            <strong>{companion.displayNameZh}</strong>
          </div>
          <div className="companion-panel__row">
            <span>身份</span>
            <strong>{companion.roleLabelZh}</strong>
          </div>
          <div className="companion-panel__row">
            <span>风格</span>
            <strong>{companion.signature}</strong>
          </div>
          <div className="companion-panel__row companion-panel__row--strategy">
            <span>策略</span>
            <strong>{companion.strategyLabelZh}</strong>
          </div>
        </div>

        <CompanionChatStream
          key={chatKey}
          behaviorState={behaviorState}
          feedItems={feedItems}
        />

        <PixelAvatar behaviorState={behaviorState} companion={companion} />
      </div>
    </PixelWindow>
  );
}
