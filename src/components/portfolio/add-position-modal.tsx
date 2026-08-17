"use client";

import { useEffect } from "react";
import { AddPositionForm } from "@/components/portfolio/add-position-form";
import { Icon } from "@/components/ui/icon";
import type { CreatePositionRequest } from "@/types/portfolio";

export function AddPositionModal({ open, isSubmitting, onClose, onSubmit }: { open: boolean; isSubmitting: boolean; onClose: () => void; onSubmit: (request: CreatePositionRequest) => Promise<boolean> }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape" && !isSubmitting) onClose(); };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKeyDown); document.body.style.overflow = ""; };
  }, [isSubmitting, onClose, open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] grid place-items-end p-0 sm:place-items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="add-position-title">
      <button className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" onClick={isSubmitting ? undefined : onClose} aria-label="Close add holding dialog" />
      <section className="relative w-full animate-fade-up rounded-t-3xl border border-line bg-panel p-6 shadow-2xl sm:max-w-md sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4"><div><p className="eyebrow">New investment</p><h2 id="add-position-title" className="mt-1 text-xl font-bold tracking-[-0.03em]">Add a holding</h2><p className="mt-2 text-xs leading-5 text-subtle">Enter a supported ticker and the number of shares you own.</p></div><button onClick={onClose} disabled={isSubmitting} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line text-subtle hover:bg-raised hover:text-ink" aria-label="Close dialog"><Icon name="x" /></button></div>
        <AddPositionForm isSubmitting={isSubmitting} onSubmit={onSubmit} />
      </section>
    </div>
  );
}
