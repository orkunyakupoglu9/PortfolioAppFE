export function DashboardSkeleton() {
  return (
    <section className="mx-auto max-w-[1500px] animate-pulse space-y-6" aria-busy="true" aria-label="Loading portfolio dashboard">
      <div className="flex items-end justify-between"><div><div className="skeleton h-3 w-32" /><div className="skeleton mt-4 h-10 w-72 max-w-[70vw]" /><div className="skeleton mt-3 h-3 w-56" /></div><div className="hidden gap-2 sm:flex"><div className="skeleton h-10 w-10" /><div className="skeleton h-10 w-28" /></div></div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div className="panel p-5" key={index}><div className="skeleton h-3 w-24" /><div className="skeleton mt-4 h-7 w-36" /><div className="skeleton mt-4 h-2.5 w-20" /></div>)}</div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_310px]"><div className="panel p-6"><div className="skeleton h-5 w-44" /><div className="skeleton mt-8 h-64 w-full" /></div><div className="panel hidden p-5 xl:block"><div className="skeleton h-5 w-28" />{Array.from({ length: 4 }).map((_, i) => <div className="mt-6 flex gap-3" key={i}><div className="skeleton h-8 w-8" /><div className="flex-1"><div className="skeleton h-3 w-full" /><div className="skeleton mt-2 h-2 w-2/3" /></div></div>)}</div></div>
      <div className="panel p-6"><div className="skeleton h-5 w-36" />{Array.from({ length: 4 }).map((_, i) => <div className="skeleton mt-5 h-12 w-full" key={i} />)}</div>
    </section>
  );
}
