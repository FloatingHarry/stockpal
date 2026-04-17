import type { ReactNode } from "react";

type StatusHeaderProps = {
  title: string;
  subtitle: string;
  dateLabel: string;
  marketLabel: string;
  headline: string;
  actions?: ReactNode;
};

export function StatusHeader({
  title,
  subtitle,
  dateLabel,
  marketLabel,
  headline,
  actions,
}: StatusHeaderProps) {
  return (
    <header className="status-header">
      <div className="status-header__inner">
        <div className="flex flex-wrap items-center gap-2">
          <span className="status-chip status-chip--primary pixel-mono">
            {dateLabel}
          </span>
          <span className="status-chip status-chip--warm">{marketLabel}</span>
        </div>

        <div className="min-w-[240px] flex-1 text-center">
          <h1 className="status-title">{title}</h1>
          <p className="status-subtitle">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="status-chip pixel-mono">{headline}</span>
          {actions}
        </div>
      </div>
    </header>
  );
}
