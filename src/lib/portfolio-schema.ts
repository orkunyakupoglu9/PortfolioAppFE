import { z } from "zod";

export const portfolioPositionSchema = z.object({
  ticker: z.string().min(1),
  companyName: z.string().min(1),
  sector: z.string().min(1),
  shares: z.number().nonnegative(),
  currentPrice: z.number().nonnegative(),
  previousClose: z.number().nonnegative(),
  changePercent: z.number(),
  averagePrice: z.number().nonnegative(),
  volume: z.number().nonnegative(),
  sparkline: z.array(z.number()).min(2),
  lastUpdated: z.string(),
});

export const portfolioResponseSchema = z.array(portfolioPositionSchema);

export const watchlistItemSchema = z.object({
  ticker: z.string().min(1),
  companyName: z.string().min(1),
  currentPrice: z.number().nonnegative(),
  changePercent: z.number(),
});

export const watchlistResponseSchema = z.array(watchlistItemSchema);
