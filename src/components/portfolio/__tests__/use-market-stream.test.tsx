import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMarketStream } from "@/hooks/use-market-stream";
import { portfolioSummaryFixture } from "@/components/portfolio/__tests__/fixtures/portfolio";

type MessageCallback = (message: { body: string }) => void;
type ClientConfig = {
  reconnectDelay: number;
  connectionTimeout: number;
  onConnect: () => void;
  onWebSocketClose: () => void;
};

const stomp = vi.hoisted(() => ({
  configs: [] as unknown[],
  callbacks: [] as Array<(message: { body: string }) => void>,
  destinations: [] as string[],
  activate: vi.fn(),
  deactivate: vi.fn(() => Promise.resolve()),
  unsubscribe: vi.fn(),
}));

vi.mock("@stomp/stompjs", () => ({
  Client: class {
    connected = true;

    constructor(config: unknown) {
      stomp.configs.push(config);
    }

    activate() {
      stomp.activate();
    }

    deactivate() {
      return stomp.deactivate();
    }

    subscribe(destination: string, callback: MessageCallback) {
      stomp.destinations.push(destination);
      stomp.callbacks.push(callback);
      return { id: "portfolio-test", unsubscribe: stomp.unsubscribe };
    }
  },
}));

describe("useMarketStream", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stomp.configs.length = 0;
    stomp.callbacks.length = 0;
    stomp.destinations.length = 0;
  });

  it("configures reconnects, subscribes, and releases resources on unmount", () => {
    const onPortfolio = vi.fn();
    const onError = vi.fn();
    const { result, unmount } = renderHook(() =>
      useMarketStream({ onPortfolio, onError }),
    );
    const config = stomp.configs[0] as ClientConfig;

    expect(result.current).toBe("connecting");
    expect(config.reconnectDelay).toBe(5_000);
    expect(config.connectionTimeout).toBe(8_000);
    expect(stomp.activate).toHaveBeenCalledOnce();

    act(() => config.onConnect());
    expect(result.current).toBe("live");
    expect(stomp.destinations).toEqual(["/topic/portfolio"]);

    act(() => {
      stomp.callbacks[0]({
        body: JSON.stringify({
          type: "PORTFOLIO_UPDATE",
          timestamp: "2026-08-18T10:00:01Z",
          portfolio: portfolioSummaryFixture,
          errorCode: null,
          errorMessage: null,
        }),
      });
    });
    expect(onPortfolio).toHaveBeenCalledWith(portfolioSummaryFixture);

    unmount();
    expect(stomp.unsubscribe).toHaveBeenCalledOnce();
    expect(stomp.deactivate).toHaveBeenCalledOnce();

    onPortfolio.mockClear();
    act(() => stomp.callbacks[0]({ body: "{}" }));
    act(() => config.onWebSocketClose());
    expect(onPortfolio).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });
});
