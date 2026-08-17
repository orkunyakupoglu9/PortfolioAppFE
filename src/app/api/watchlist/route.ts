import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addMockWatchlistItem, getMockWatchlist } from "@/lib/mock-portfolio-store";

// TODO(API): Replace the mock store with the real watchlist endpoints.
const requestSchema = z.object({ ticker: z.string().trim().min(1).max(10) });

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 260));
  return NextResponse.json(getMockWatchlist());
}

export async function POST(request: NextRequest) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: "Enter a valid symbol." }, { status: 400 });
  try {
    return NextResponse.json(addMockWatchlistItem(parsed.data.ticker), { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Could not update watchlist." }, { status: 404 });
  }
}
