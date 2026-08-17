"use client";

import { useEffect } from "react";
import { Icon } from "@/components/ui/icon";

export function ThemeToggle() {
  useEffect(() => {
    const saved = window.localStorage.getItem("portfolio-dashboard-theme");
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    const initial = saved ?? preferred;
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  function toggleTheme() {
    const next = document.documentElement.classList.contains("dark") ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    window.localStorage.setItem("portfolio-dashboard-theme", next);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-panel text-subtle transition hover:bg-raised hover:text-ink"
    >
      <Icon name="moon" className="h-[18px] w-[18px] dark:hidden" />
      <Icon name="sun" className="hidden h-[18px] w-[18px] dark:block" />
    </button>
  );
}
