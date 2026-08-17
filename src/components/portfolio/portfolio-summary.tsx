import { Icon, type IconName } from "@/components/ui/icon";
import {
  currencyFormatter,
  formatPercent,
  formatSignedCurrency,
} from "@/lib/format";
import type { PortfolioSummary as PortfolioSummaryData } from "@/types/portfolio";

export function PortfolioSummary({
  summary,
}: {
  summary: PortfolioSummaryData;
}) {
  const largest = [...summary.portfolio].sort(
    (left, right) => right.marketValue - left.marketValue,
  )[0];
  const allocation =
    largest && summary.totalValue > 0
      ? (largest.marketValue / summary.totalValue) * 100
      : 0;
  const dayTone = summary.totalDailyProfitLoss >= 0 ? "positive" : "negative";

  const cards: {
    label: string;
    value: string;
    detail: string;
    tone: "neutral" | "positive" | "negative";
    icon: IconName;
  }[] = [
    {
      label: "Total balance",
      value: currencyFormatter.format(summary.totalValue),
      detail: `${summary.portfolio.length} active holdings`,
      tone: "neutral",
      icon: "wallet",
    },
    {
      label: "Today's P&L",
      value: formatSignedCurrency(summary.totalDailyProfitLoss),
      detail: `${formatPercent(summary.totalDailyChangePercentage)} today`,
      tone: dayTone,
      icon: summary.totalDailyProfitLoss >= 0 ? "arrow-up" : "arrow-down",
    },
    {
      label: "Largest position",
      value: largest?.ticker ?? "—",
      detail: largest
        ? `${formatPercent(allocation)} of portfolio`
        : "No holdings yet",
      tone: "neutral",
      icon: "chart",
    },
    {
      label: "Top performer",
      value: summary.bestPerformer?.ticker ?? "—",
      detail: summary.bestPerformer
        ? `${formatPercent(summary.bestPerformer.changePercentage)} today`
        : "No holdings yet",
      tone:
        (summary.bestPerformer?.changePercentage ?? 0) >= 0
          ? "positive"
          : "negative",
      icon: "trophy",
    },
  ];

  return (
    <section
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Portfolio summary"
    >
      {cards.map((card, index) => (
        <article
          key={card.label}
          className="panel animate-fade-up p-5"
          style={{ animationDelay: `${index * 55}ms` }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-subtle">{card.label}</p>
              <p className="mt-2 text-[25px] font-bold tracking-[-0.04em] text-ink">
                {card.value}
              </p>
            </div>
            <span
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${card.tone === "positive" ? "bg-positive/10 text-positive" : card.tone === "negative" ? "bg-negative/10 text-negative" : "bg-brand/10 text-brand"}`}
            >
              <Icon name={card.icon} className="h-[18px] w-[18px]" />
            </span>
          </div>
          <p
            className={`mt-3 text-xs ${card.tone === "positive" ? "text-positive" : card.tone === "negative" ? "text-negative" : "text-subtle"}`}
          >
            {card.detail}
          </p>
        </article>
      ))}
    </section>
  );
}
