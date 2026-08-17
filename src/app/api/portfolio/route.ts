import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addMockPosition, getMockPortfolio } from "@/lib/mock-portfolio-store";

// TODO(API): Replace this route's mock store calls with the real backend request.
const createPositionSchema = z.object({
  ticker: z.string().trim().min(1).max(10).regex(/^[A-Za-z][A-Za-z0-9.-]*$/),
  shares: z.number().int().positive(),
  averagePrice: z.number().positive().optional(),
});

const demoDelay = () => new Promise((resolve) => setTimeout(resolve, 420));

export async function GET() {
  await demoDelay();
  return NextResponse.json(getMockPortfolio(), { headers: { "x-data-source": "demo" } });
}

export async function POST(request: NextRequest) {
  await demoDelay();
  const parsed = createPositionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Please provide a valid symbol, share amount and cost basis." }, { status: 400 });
  }
  try {
    return NextResponse.json(addMockPosition(parsed.data.ticker, parsed.data.shares, parsed.data.averagePrice), { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Could not add holding." }, { status: 404 });
  }
}
