import { Icon } from "@/components/ui/icon";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { ConnectionState } from "@/types/portfolio";

type DashboardHeaderProps = {
  connectionState: ConnectionState;
  isRefreshing: boolean;
  onAdd: () => void;
  onRefresh: () => void;
};

const statusText: Record<ConnectionState, string> = {
  connecting: "Connecting",
  live: "Live market",
  offline: "Reconnecting",
};

export function DashboardHeader({ connectionState, isRefreshing, onAdd, onRefresh }: DashboardHeaderProps) {
  const today = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date());

  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <p className="eyebrow">Portfolio overview</p>
          <span className="h-1 w-1 rounded-full bg-subtle/50" />
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${connectionState === "offline" ? "text-negative" : "text-positive"}`}>
            <span className="relative flex h-1.5 w-1.5">
              {connectionState !== "offline" ? <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-positive opacity-50" /> : null}
              <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${connectionState === "offline" ? "bg-negative" : "bg-positive"}`} />
            </span>
            {statusText[connectionState]}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-[-0.045em] text-ink md:text-[38px]">Good morning, Orkun</h1>
        <p className="mt-2 text-sm text-subtle">Here&apos;s how your investments are doing · <time suppressHydrationWarning>{today}</time></p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onRefresh} disabled={isRefreshing} className="button-secondary !w-10 !px-0" aria-label="Refresh portfolio">
          <Icon name="refresh" className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
        <ThemeToggle />
        <button className="hidden h-10 w-10 place-items-center rounded-xl border border-line bg-panel text-subtle hover:bg-raised sm:grid" aria-label="Notifications">
          <Icon name="bell" className="h-[18px] w-[18px]" />
        </button>
        <button onClick={onAdd} className="button-primary ml-1 flex-1 sm:flex-none">
          <Icon name="plus" /> Add holding
        </button>
      </div>
    </header>
  );
}
