import { Icon, type IconName } from "@/components/ui/icon";
import { currencyFormatter, formatPercent, formatSignedCurrency } from "@/lib/format";
import { bestPerformer, totalDayChange, totalPortfolioValue, totalProfitLoss, totalProfitLossPercent } from "@/lib/portfolio-metrics";
import type { PortfolioPosition } from "@/types/portfolio";

export function PortfolioSummary({ positions }: { positions: PortfolioPosition[] }) {
  const totalValue = totalPortfolioValue(positions);
  const dayChange = totalDayChange(positions);
  const previousValue = totalValue - dayChange;
  const dayPercent = previousValue === 0 ? 0 : (dayChange / previousValue) * 100;
  const profitLoss = totalProfitLoss(positions);
  const profitPercent = totalProfitLossPercent(positions);
  const best = bestPerformer(positions);

  const cards: { label: string; value: string; detail: string; tone: "neutral" | "positive" | "negative"; icon: IconName }[] = [
    { label: "Total balance", value: currencyFormatter.format(totalValue), detail: `${positions.length} active holdings`, tone: "neutral", icon: "wallet" },
    { label: "Today's gain", value: formatSignedCurrency(dayChange), detail: `${formatPercent(dayPercent)} today`, tone: dayChange >= 0 ? "positive" : "negative", icon: dayChange >= 0 ? "arrow-up" : "arrow-down" },
    { label: "Total return", value: formatSignedCurrency(profitLoss), detail: `${formatPercent(profitPercent)} all time`, tone: profitLoss >= 0 ? "positive" : "negative", icon: "chart" },
    { label: "Top performer", value: best?.ticker ?? "—", detail: best ? `${formatPercent(best.changePercent)} today` : "No holdings yet", tone: (best?.changePercent ?? 0) >= 0 ? "positive" : "negative", icon: "trophy" },
  ];

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Portfolio summary">
      {cards.map((card, index) => (
        <article key={card.label} className="panel animate-fade-up p-5" style={{ animationDelay: `${index * 55}ms` }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-subtle">{card.label}</p>
              <p className="mt-2 text-[25px] font-bold tracking-[-0.04em] text-ink">{card.value}</p>
            </div>
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${card.tone === "positive" ? "bg-positive/10 text-positive" : card.tone === "negative" ? "bg-negative/10 text-negative" : "bg-brand/10 text-brand"}`}>
              <Icon name={card.icon} className="h-[18px] w-[18px]" />
            </span>
          </div>
          <p className={`mt-3 text-xs ${card.tone === "positive" ? "text-positive" : card.tone === "negative" ? "text-negative" : "text-subtle"}`}>{card.detail}</p>
        </article>
      ))}
    </section>
  );
}
