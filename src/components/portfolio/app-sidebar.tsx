"use client";

import { useState } from "react";
import { Icon, type IconName } from "@/components/ui/icon";

const navItems: { label: string; icon: IconName; active?: boolean }[] = [
  { label: "Overview", icon: "dashboard", active: true },
  { label: "Portfolio", icon: "briefcase" },
  { label: "Watchlist", icon: "activity" },
  { label: "Analytics", icon: "chart" },
];

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white shadow-lg shadow-brand/20 dark:text-slate-950">
        <svg viewBox="0 0 28 28" className="h-5 w-5" fill="none" aria-hidden="true">
          <path d="M5 18.5 11 12l4 4 8-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 7h6v6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="text-[17px] font-bold tracking-[-0.04em]">Portfolio</span>
    </div>
  );
}

export function AppSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = (
    <>
      <div className="px-3"><Brand /></div>
      <nav className="mt-9 space-y-1" aria-label="Main navigation">
        {navItems.map((item) => (
          <button key={item.label} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${item.active ? "bg-brand/10 text-brand" : "text-subtle hover:bg-raised hover:text-ink"}`}>
            <Icon name={item.icon} className="h-[18px] w-[18px]" />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="mt-auto space-y-1 border-t border-line pt-4">
        {[{ label: "Settings", icon: "settings" as const }, { label: "Help center", icon: "help" as const }].map((item) => (
          <button key={item.label} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-subtle transition hover:bg-raised hover:text-ink">
            <Icon name={item.icon} className="h-[18px] w-[18px]" />{item.label}
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3 rounded-xl bg-raised p-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-emerald-300 to-emerald-700 text-xs font-bold text-white">OY</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">Orkun Yakupoğlu</p>
          <p className="truncate text-[11px] text-subtle">Portfolio manager</p>
        </div>
        <Icon name="more" className="h-4 w-4 text-subtle" />
      </div>
    </>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[228px] flex-col border-r border-line bg-panel/90 p-5 backdrop-blur-xl lg:flex">{navigation}</aside>
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-panel/90 px-4 backdrop-blur-xl lg:hidden">
        <Brand />
        <button onClick={() => setMobileOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-line" aria-label="Open navigation"><Icon name="menu" /></button>
      </div>
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />
          <aside className="relative flex h-full w-[280px] animate-fade-up flex-col bg-panel p-5 shadow-2xl">
            <button onClick={() => setMobileOpen(false)} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl border border-line" aria-label="Close navigation"><Icon name="x" /></button>
            {navigation}
          </aside>
        </div>
      ) : null}
    </>
  );
}
