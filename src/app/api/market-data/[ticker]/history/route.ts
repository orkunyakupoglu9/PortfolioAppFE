import type { NextRequest } from "next/server";
import { proxyBackend } from "@/lib/backend-proxy";

export async function GET(request: NextRequest, { params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  return proxyBackend(request, `/api/market-data/${encodeURIComponent(ticker.toUpperCase())}/history${request.nextUrl.search}`);
}
