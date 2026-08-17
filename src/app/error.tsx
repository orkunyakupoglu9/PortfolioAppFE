"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="min-h-screen"><ErrorState message="An unexpected rendering error occurred. Your data has not been changed." onRetry={reset} /></main>;
}
