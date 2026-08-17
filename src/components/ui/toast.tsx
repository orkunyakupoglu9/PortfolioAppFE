"use client";

import { useEffect } from "react";
import { Icon } from "@/components/ui/icon";

export type ToastMessage = {
  id: number;
  title: string;
  description?: string;
  variant: "success" | "error";
};

type ToastProps = ToastMessage & { onDismiss: (id: number) => void };

export function Toast({ id, title, description, variant, onDismiss }: ToastProps) {
  useEffect(() => {
    const timeout = window.setTimeout(() => onDismiss(id), 4200);
    return () => window.clearTimeout(timeout);
  }, [id, onDismiss]);

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className="flex w-[min(92vw,380px)] animate-fade-up items-start gap-3 rounded-2xl border border-line bg-panel p-4 shadow-2xl"
    >
      <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${variant === "success" ? "bg-brand/10 text-brand" : "bg-negative/10 text-negative"}`}>
        <Icon name={variant === "success" ? "bolt" : "help"} className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{title}</p>
        {description ? <p className="mt-1 text-xs leading-5 text-subtle">{description}</p> : null}
      </div>
      <button onClick={() => onDismiss(id)} className="rounded-lg p-1 text-subtle hover:bg-raised hover:text-ink" aria-label="Dismiss notification">
        <Icon name="x" />
      </button>
    </div>
  );
}

export function ToastViewport({ messages, onDismiss }: { messages: ToastMessage[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-[70] flex flex-col gap-3" aria-live="polite">
      {messages.map((message) => <Toast key={message.id} {...message} onDismiss={onDismiss} />)}
    </div>
  );
}
