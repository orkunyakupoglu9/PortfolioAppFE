import type { PortfolioHolding } from "@/types/portfolio";

export function positionValue(position: PortfolioHolding): number {
  return position.marketValue;
}

export function totalPortfolioValue(positions: PortfolioHolding[]): number {
  return positions.reduce((total, position) => total + position.marketValue, 0);
}

export function totalDayChange(positions: PortfolioHolding[]): number {
  return positions.reduce((total, position) => total + position.dailyProfitLoss, 0);
}

export function bestPerformer(positions: PortfolioHolding[]): PortfolioHolding | null {
  if (positions.length === 0) return null;
  return positions.reduce((best, current) => current.changePercentage > best.changePercentage ? current : best);
}

export function worstPerformer(positions: PortfolioHolding[]): PortfolioHolding | null {
  if (positions.length === 0) return null;
  return positions.reduce((worst, current) => current.changePercentage < worst.changePercentage ? current : worst);
}
