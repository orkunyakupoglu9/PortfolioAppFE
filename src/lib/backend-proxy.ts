import "server-only";

import { NextResponse } from "next/server";

const backendUrl = (process.env.BACKEND_URL ?? "http://localhost:8080").replace(/\/$/, "");

export async function proxyBackend(request: Request, path: string): Promise<NextResponse> {
  try {
    const hasBody = request.method !== "GET" && request.method !== "HEAD";
    const body = hasBody ? await request.arrayBuffer() : undefined;
    const response = await fetch(`${backendUrl}${path}`, {
      method: request.method,
      headers: {
        accept: request.headers.get("accept") ?? "application/json",
        ...(hasBody ? { "content-type": request.headers.get("content-type") ?? "application/json" } : {}),
      },
      body: body && body.byteLength > 0 ? body : undefined,
      cache: "no-store",
    });

    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") ?? "application/json",
        "cache-control": "no-store",
      },
    });
  } catch {
    const requestUrl = new URL(request.url);
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 503,
      error: "Service Unavailable",
      code: "BACKEND_UNAVAILABLE",
      message: "Portfolio backend is unavailable.",
      path: requestUrl.pathname,
      validationErrors: {},
    }, { status: 503 });
  }
}
