"use client";

import { useEffect, useState } from "react";
import { Client, type StompSubscription } from "@stomp/stompjs";
import { portfolioUpdateEventSchema } from "@/lib/portfolio-schema";
import type { ConnectionState, PortfolioSummary } from "@/types/portfolio";

type UseMarketStreamOptions = {
  onPortfolio: (portfolio: PortfolioSummary) => void;
  onError: (message: string) => void;
};

export function useMarketStream({
  onPortfolio,
  onError,
}: UseMarketStreamOptions): ConnectionState {
  const [state, setState] = useState<ConnectionState>("connecting");

  useEffect(() => {
    let disposed = false;
    let subscription: StompSubscription | undefined;
    const brokerURL =
      process.env.NEXT_PUBLIC_WEBSOCKET_URL?.trim() ||
      "ws://localhost:8080/ws";
    const client = new Client({
      brokerURL,
      reconnectDelay: 5_000,
      heartbeatIncoming: 10_000,
      heartbeatOutgoing: 10_000,
      connectionTimeout: 8_000,
      onConnect: () => {
        if (disposed) return;
        setState("live");
        subscription = client.subscribe("/topic/portfolio", (message) => {
          if (disposed) return;
          try {
            const event = portfolioUpdateEventSchema.parse(
              JSON.parse(message.body) as unknown,
            );
            if (event.type === "PORTFOLIO_UPDATE" && event.portfolio)
              onPortfolio(event.portfolio);
            if (event.type === "PORTFOLIO_UPDATE_ERROR")
              onError(event.errorMessage ?? "Live market update failed.");
          } catch {
            onError("The live market stream returned an invalid message.");
          }
        });
      },
      onStompError: (frame) => {
        if (disposed) return;
        setState("offline");
        onError(
          frame.headers.message || "The live market stream reported an error.",
        );
      },
      onWebSocketClose: () => {
        if (!disposed) setState("offline");
      },
      onWebSocketError: () => {
        if (!disposed) setState("offline");
      },
    });

    client.activate();
    return () => {
      disposed = true;
      if (client.connected && subscription) {
        try {
          subscription.unsubscribe();
        } catch {
          // The socket may close between the connected check and unsubscribe.
        }
      }
      subscription = undefined;
      void client.deactivate();
    };
  }, [onError, onPortfolio]);

  return state;
}
