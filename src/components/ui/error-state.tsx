import { Icon } from "@/components/ui/icon";

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section className="mx-auto grid min-h-[70vh] max-w-xl place-items-center p-6 text-center" role="alert"><div><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-negative/10 text-negative"><Icon name="wifi" className="h-6 w-6" /></span><p className="eyebrow mt-5">Connection problem</p><h1 className="mt-2 text-2xl font-bold tracking-tight">We couldn&apos;t load your portfolio</h1><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-subtle">{message}</p><button onClick={onRetry} className="button-primary mt-6"><Icon name="refresh" /> Try again</button></div></section>
  );
}
