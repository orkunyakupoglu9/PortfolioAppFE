export class RequestTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms.`);
    this.name = "RequestTimeoutError";
  }
}

type FetchPolicy = {
  timeoutMs: number;
  maxRetries?: number;
  retryDelayMs?: number;
};

const RETRYABLE_STATUSES = new Set([408, 425, 429, 502, 503, 504]);

function requestMethod(input: RequestInfo | URL, init?: RequestInit): string {
  if (init?.method) return init.method.toUpperCase();
  return input instanceof Request ? input.method.toUpperCase() : "GET";
}

function wait(delayMs: number, signal?: AbortSignal | null): Promise<void> {
  if (signal?.aborted)
    return Promise.reject(
      signal.reason ?? new DOMException("Request aborted", "AbortError"),
    );
  if (delayMs <= 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const finish = () => {
      signal?.removeEventListener("abort", abort);
      resolve();
    };
    const abort = () => {
      clearTimeout(timeout);
      reject(signal?.reason ?? new DOMException("Request aborted", "AbortError"));
    };
    const timeout = setTimeout(finish, delayMs);
    signal?.addEventListener("abort", abort, { once: true });
  });
}

export async function fetchWithPolicy(
  input: RequestInfo | URL,
  init: RequestInit = {},
  policy: FetchPolicy,
): Promise<Response> {
  const method = requestMethod(input, init);
  const canRetry = method === "GET" || method === "HEAD";
  const maxRetries = canRetry ? (policy.maxRetries ?? 0) : 0;
  const retryDelayMs = policy.retryDelayMs ?? 250;
  const controller = new AbortController();
  let timedOut = false;
  const abortFromCaller = () => controller.abort(init.signal?.reason);
  if (init.signal?.aborted) abortFromCaller();
  else init.signal?.addEventListener("abort", abortFromCaller, { once: true });
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, policy.timeoutMs);

  try {
    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      try {
        const response = await fetch(input, {
          ...init,
          signal: controller.signal,
        });
        const shouldRetry =
          attempt < maxRetries && RETRYABLE_STATUSES.has(response.status);
        if (!shouldRetry) return response;
        await response.body?.cancel();
      } catch (error) {
        if (init.signal?.aborted || timedOut || attempt >= maxRetries)
          throw error;
      }

      await wait(retryDelayMs * 2 ** attempt, controller.signal);
    }
  } catch (error) {
    if (timedOut) throw new RequestTimeoutError(policy.timeoutMs);
    throw error;
  } finally {
    clearTimeout(timeout);
    init.signal?.removeEventListener("abort", abortFromCaller);
  }

  throw new Error("Request retry policy exhausted.");
}
