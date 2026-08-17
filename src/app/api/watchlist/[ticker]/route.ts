import { NextResponse } from "next/server";
import { removeMockWatchlistItem } from "@/lib/mock-portfolio-store";

export async function DELETE(_request: Request, { params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const removed = removeMockWatchlistItem(decodeURIComponent(ticker));
  return removed
    ? new NextResponse(null, { status: 204 })
    : NextResponse.json({ message: "Watchlist item was not found." }, { status: 404 });
}
