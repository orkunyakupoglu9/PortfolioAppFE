"use client";

import { useEffect, useRef, useState } from "react";
import type { ConnectionState, MarketUpdate } from "@/types/portfolio";

type UseMarketStreamOptions = {
  symbols: string[];
  onUpdate: (update: MarketUpdate) => void;
};

function isMarketUpdate(value: unknown): value is MarketUpdate {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.ticker === "string"
    && typeof candidate.currentPrice === "number"
    && typeof candidate.changePercent === "number"
    && typeof candidate.volume === "number"
    && typeof candidate.timestamp === "string";
}

export function useMarketStream({ symbols, onUpdate }: UseMarketStreamOptions): ConnectionState {
  const [state, setState] = useState<ConnectionState>(() => process.env.NEXT_PUBLIC_WEBSOCKET_URL ? "connecting" : "simulated");
  const callbackRef = useRef(onUpdate);
  const symbolsKey = [...symbols].sort().join(",");

  useEffect(() => {
    callbackRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    const activeSymbols = symbolsKey.split(",").filter(Boolean);
    const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;

    // TODO(WEBSOCKET): Remove this simulator after NEXT_PUBLIC_WEBSOCKET_URL is configured.
    if (!websocketUrl) {
      const interval = window.setInterval(() => {
        if (activeSymbols.length === 0) return;
        const ticker = activeSymbols[Math.floor(Math.random() * activeSymbols.length)];
        const drift = (Math.random() - 0.47) * 0.004;
        callbackRef.current({
          ticker,
          currentPrice: drift,
          changePercent: drift * 100,
          volume: Math.floor(10_000 + Math.random() * 90_000),
          timestamp: new Date().toISOString(),
          isDelta: true,
        });
      }, 2800);
      return () => window.clearInterval(interval);
    }

    let socket: WebSocket | null = null;
    let reconnectTimer: number | null = null;
    let reconnectAttempt = 0;
    let disposed = false;

    const connect = () => {
      if (disposed) return;
      socket = new WebSocket(websocketUrl);
      socket.addEventListener("open", () => {
        reconnectAttempt = 0;
        setState("live");
        socket?.send(JSON.stringify({ type: "subscribe", symbols: activeSymbols }));
      });
      socket.addEventListener("message", (event) => {
        try {
          const payload: unknown = JSON.parse(String(event.data));
          const candidate = payload && typeof payload === "object" && "data" in payload
            ? (payload as { data: unknown }).data
            : payload;
          if (isMarketUpdate(candidate)) callbackRef.current(candidate);
        } catch {
          // Ignore malformed ticks; the next valid update keeps the stream alive.
        }
      });
      socket.addEventListener("close", () => {
        if (disposed) return;
        setState("offline");
        const delay = Math.min(1000 * 2 ** reconnectAttempt, 15_000);
        reconnectAttempt += 1;
        reconnectTimer = window.setTimeout(connect, delay);
      });
      socket.addEventListener("error", () => socket?.close());
    };

    connect();
    return () => {
      disposed = true;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [symbolsKey]);

  return state;
}
