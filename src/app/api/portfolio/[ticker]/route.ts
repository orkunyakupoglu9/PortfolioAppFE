import type { NextRequest } from "next/server";
import { proxyBackend } from "@/lib/backend-proxy";

type RouteContext = { params: Promise<{ ticker: string }> };

async function holdingPath(context: RouteContext): Promise<string> {
  const { ticker } = await context.params;
  return `/api/portfolio/${encodeURIComponent(ticker.toUpperCase())}`;
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyBackend(request, await holdingPath(context));
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyBackend(request, await holdingPath(context));
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyBackend(request, await holdingPath(context));
}
