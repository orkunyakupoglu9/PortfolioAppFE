import { z } from "zod";

export const portfolioHoldingSchema = z.object({
  id: z.string().uuid(),
  ticker: z.string().min(1),
  companyName: z.string().min(1),
  shares: z.number().positive(),
  currency: z.string().min(1),
  currentPrice: z.number().nonnegative(),
  previousClose: z.number().nonnegative(),
  priceChange: z.number(),
  changePercentage: z.number(),
  volume: z.number().nonnegative().nullable(),
  marketValue: z.number().nonnegative(),
  dailyProfitLoss: z.number(),
  marketTime: z.string(),
});

export const portfolioSummarySchema = z.object({
  portfolio: z.array(portfolioHoldingSchema),
  totalValue: z.number().nonnegative(),
  totalDailyProfitLoss: z.number(),
  totalDailyChangePercentage: z.number(),
  bestPerformer: portfolioHoldingSchema.nullable(),
  worstPerformer: portfolioHoldingSchema.nullable(),
  asOf: z.string(),
});

export const marketQuoteSchema = z.object({
  ticker: z.string().min(1),
  companyName: z.string().min(1),
  currency: z.string().min(1),
  currentPrice: z.number().nonnegative(),
  previousClose: z.number().nonnegative(),
  priceChange: z.number(),
  changePercentage: z.number(),
  volume: z.number().nonnegative().nullable(),
  marketTime: z.string(),
});

export const watchlistItemSchema = marketQuoteSchema.extend({
  id: z.string().uuid(),
});

export const watchlistResponseSchema = z.array(watchlistItemSchema);

export const historicalPriceResponseSchema = z.object({
  ticker: z.string(),
  currency: z.string(),
  range: z.string(),
  interval: z.string(),
  prices: z.array(
    z.object({
      timestamp: z.string(),
      open: z.number().nullable(),
      high: z.number().nullable(),
      low: z.number().nullable(),
      close: z.number(),
      volume: z.number().nonnegative().nullable(),
    }),
  ),
});

export const portfolioUpdateEventSchema = z.object({
  type: z.enum(["PORTFOLIO_UPDATE", "PORTFOLIO_UPDATE_ERROR"]),
  timestamp: z.string(),
  portfolio: portfolioSummarySchema.nullable(),
  errorCode: z.string().nullable(),
  errorMessage: z.string().nullable(),
});
