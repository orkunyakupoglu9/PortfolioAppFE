import { NextResponse } from "next/server";
import { removeMockPosition } from "@/lib/mock-portfolio-store";

// TODO(API): Proxy this request to DELETE {BACKEND_URL}/api/portfolio/{ticker}.
export async function DELETE(_request: Request, { params }: { params: Promise<{ ticker: string }> }) {
  await new Promise((resolve) => setTimeout(resolve, 320));
  const { ticker } = await params;
  const removed = removeMockPosition(decodeURIComponent(ticker));
  if (!removed) return NextResponse.json({ message: "Holding was not found." }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
