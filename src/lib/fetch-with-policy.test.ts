import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchWithPolicy,
  RequestTimeoutError,
} from "@/lib/fetch-with-policy";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("fetchWithPolicy", () => {
  it("retries transient GET responses", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response("ok", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await fetchWithPolicy("https://backend.test/portfolio", {}, {
      timeoutMs: 1_000,
      maxRetries: 2,
      retryDelayMs: 0,
    });

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not retry mutations", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 503 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await fetchWithPolicy(
      "https://backend.test/portfolio",
      { method: "POST", body: "{}" },
      { timeoutMs: 1_000, maxRetries: 2, retryDelayMs: 0 },
    );

    expect(response.status).toBe(503);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("aborts and reports requests that exceed the timeout", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(new DOMException("Request aborted", "AbortError")),
          );
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const request = fetchWithPolicy("https://backend.test/portfolio", {}, {
      timeoutMs: 25,
      maxRetries: 0,
    });
    const assertion = expect(request).rejects.toBeInstanceOf(RequestTimeoutError);
    await vi.advanceTimersByTimeAsync(25);

    await assertion;
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
