import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <DashboardSkeleton />
    </main>
  );
}
