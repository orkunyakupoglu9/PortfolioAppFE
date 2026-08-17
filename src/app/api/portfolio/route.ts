import type { NextRequest } from "next/server";
import { proxyBackend } from "@/lib/backend-proxy";

export async function GET(request: NextRequest) {
  return proxyBackend(request, `/api/portfolio${request.nextUrl.search}`);
}

export async function POST(request: NextRequest) {
  return proxyBackend(request, "/api/portfolio");
}
