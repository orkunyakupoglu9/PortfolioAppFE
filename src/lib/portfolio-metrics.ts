import type { PortfolioPosition } from "@/types/portfolio";

export function positionValue(position: PortfolioPosition): number {
  return position.currentPrice * position.shares;
}

export function totalPortfolioValue(
  positions: PortfolioPosition[],
): number {
  return positions.reduce(
    (total, position) => total + positionValue(position),
    0,
  );
}

export function totalProfitLoss(
  positions: PortfolioPosition[],
): number {
  return positions.reduce((total, position) => {
    return total + (position.currentPrice - position.averagePrice) * position.shares;
  }, 0);
}

export function totalDayChange(positions: PortfolioPosition[]): number {
  return positions.reduce((total, position) => total + (position.currentPrice - position.previousClose) * position.shares, 0);
}

export function totalProfitLossPercent(positions: PortfolioPosition[]): number {
  const cost = positions.reduce((total, position) => total + position.averagePrice * position.shares, 0);
  return cost === 0 ? 0 : (totalProfitLoss(positions) / cost) * 100;
}

export function bestPerformer(
  positions: PortfolioPosition[],
): PortfolioPosition | null {
  if (positions.length === 0) {
    return null;
  }

  return positions.reduce((best, current) =>
    current.changePercent > best.changePercent ? current : best,
  );
}

export function worstPerformer(positions: PortfolioPosition[]): PortfolioPosition | null {
  if (positions.length === 0) return null;
  return positions.reduce((worst, current) => current.changePercent < worst.changePercent ? current : worst);
}

export function portfolioHistory(positions: PortfolioPosition[]): number[] {
  if (positions.length === 0) return [];
  const maxLength = Math.max(...positions.map((position) => position.sparkline.length));
  return Array.from({ length: maxLength }, (_, index) =>
    positions.reduce((total, position) => {
      const offset = Math.max(0, position.sparkline.length - maxLength);
      const price = position.sparkline[Math.max(0, index + offset)] ?? position.sparkline[0];
      return total + price * position.shares;
    }, 0),
  );
}
