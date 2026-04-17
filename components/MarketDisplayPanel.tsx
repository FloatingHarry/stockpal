import { PixelWindow } from "@/components/PixelWindow";
import type { PortfolioSnapshot } from "@/lib/mock-data";

type MarketDisplayPanelProps = {
  portfolio: PortfolioSnapshot;
};

function getCandleDirection(open: number, close: number) {
  return close >= open ? "up" : "down";
}

function getBoardTone(board: string) {
  if (board.includes("AI")) {
    return "ai";
  }

  if (board.includes("云")) {
    return "cloud";
  }

  if (board.includes("半导体")) {
    return "semis";
  }

  if (board.includes("大盘") || board.includes("指数")) {
    return "index";
  }

  return "index";
}

export function MarketDisplayPanel({ portfolio }: MarketDisplayPanelProps) {
  return (
    <PixelWindow
      bodyClassName="pixel-window__body--dense"
      className="pixel-window--tall"
      label="市场概览"
      title="图表展示"
    >
      <div className="market-panel">
        <div className="market-panel__summary">
          <div className="market-panel__summary-card">
            <span className="market-panel__summary-label">摘要</span>
            <strong>{portfolio.marketSnapshot.availableLabel}</strong>
          </div>

          <div className="market-panel__summary-card">
            <span className="market-panel__summary-label">焦点板块</span>
            <strong>{portfolio.marketSnapshot.focusBoardLabel}</strong>
          </div>
        </div>

        <div className="market-chart">
          <div className="market-chart__topline">
            <span>{portfolio.marketSnapshot.indexLabel}</span>
            <span className="pixel-mono">{portfolio.focusTicker}</span>
          </div>

          <div className="market-chart__grid">
            {portfolio.chartSeries.map((point) => {
              const direction = getCandleDirection(point.open, point.close);
              const bodyTop = 100 - Math.max(point.open, point.close);
              const bodyHeight = Math.max(Math.abs(point.close - point.open), 8);

              return (
                <div key={point.label} className="market-chart__col">
                  <div className="market-chart__canvas">
                    <span
                      className={`market-chart__wick market-chart__wick--${direction}`}
                      style={{
                        top: `${100 - point.high}%`,
                        height: `${Math.max(point.high - point.low, 12)}%`,
                      }}
                    />
                    <span
                      className={`market-chart__body market-chart__body--${direction}`}
                      style={{
                        top: `${bodyTop}%`,
                        height: `${bodyHeight}%`,
                      }}
                    />
                    <span
                      className={`market-chart__volume market-chart__volume--${direction}`}
                      style={{ height: `${point.volume}%` }}
                    />
                  </div>

                  <span className="market-chart__time pixel-mono">{point.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="market-panel__bottom">
          <div className="market-heat">
            <div className="market-heat__header">板块热度</div>

            <div className="market-heat__list">
              {portfolio.breadthSeries.map((point) => (
                <div key={point.label} className="market-heat__row">
                  <div className="market-heat__row-top">
                    <span>{point.label}</span>
                    <span>{point.value}</span>
                  </div>

                  <div className="market-heat__meter">
                    <div
                      className="market-heat__meter-fill"
                      style={{
                        width: `${point.value}%`,
                        backgroundColor: point.value > 70 ? "#294d9b" : "#eaa13c",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="watch-table">
            <div className="watch-table__header">
              <span>关注表</span>
              <span className="watch-table__header-tag">{portfolio.watchTable.length} 项</span>
            </div>

            <div className="watch-table__list">
              {portfolio.watchTable.map((row) => (
                <article
                  key={row.ticker}
                  className={`watch-table__row watch-table__row--${getBoardTone(row.board)}`}
                >
                  <div className="watch-table__row-main">
                    <span className="watch-table__ticker">{row.ticker}</span>
                    <span className="watch-table__name">{row.name}</span>
                    <span className="watch-table__change">{row.change}</span>
                  </div>

                  <div className="watch-table__row-sub">
                    <span>板块 {row.board}</span>
                    <span>热度 {row.heat}</span>
                    <span>状态 {row.state}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PixelWindow>
  );
}
