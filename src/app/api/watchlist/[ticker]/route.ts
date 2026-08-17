import type { NextRequest } from "next/server";
import { proxyBackend } from "@/lib/backend-proxy";

type RouteContext = { params: Promise<{ ticker: string }> };

async function watchlistPath(context: RouteContext): Promise<string> {
  const { ticker } = await context.params;
  return `/api/watchlist/${encodeURIComponent(ticker.toUpperCase())}`;
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyBackend(request, await watchlistPath(context));
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyBackend(request, await watchlistPath(context));
}
