import "server-only";

import { NextResponse } from "next/server";
import { fetchWithPolicy, RequestTimeoutError } from "@/lib/fetch-with-policy";

const backendUrl = (process.env.BACKEND_URL ?? "http://localhost:8080").replace(/\/$/, "");
const BACKEND_TIMEOUT_MS = 10_000;

export async function proxyBackend(request: Request, path: string): Promise<NextResponse> {
  try {
    const hasBody = request.method !== "GET" && request.method !== "HEAD";
    const body = hasBody ? await request.arrayBuffer() : undefined;
    const response = await fetchWithPolicy(
      `${backendUrl}${path}`,
      {
        method: request.method,
        headers: {
          accept: request.headers.get("accept") ?? "application/json",
          ...(hasBody
            ? {
                "content-type":
                  request.headers.get("content-type") ?? "application/json",
              }
            : {}),
        },
        body: body && body.byteLength > 0 ? body : undefined,
        cache: "no-store",
        signal: request.signal,
      },
      { timeoutMs: BACKEND_TIMEOUT_MS, maxRetries: 2 },
    );

    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") ?? "application/json",
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    const requestUrl = new URL(request.url);
    const timedOut = error instanceof RequestTimeoutError;
    const status = timedOut ? 504 : 503;
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status,
        error: timedOut ? "Gateway Timeout" : "Service Unavailable",
        code: timedOut ? "BACKEND_TIMEOUT" : "BACKEND_UNAVAILABLE",
        message: timedOut
          ? "Portfolio backend request timed out."
          : "Portfolio backend is unavailable.",
        path: requestUrl.pathname,
        validationErrors: {},
      },
      { status },
    );
  }
}
