import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();

  logger.info(
    {
      requestId,
      path: request.nextUrl.pathname,
      userAgent: request.headers.get("user-agent"),
      region: process.env.VERCEL_REGION ?? "local",
    },
    "Handling info request"
  );

  logger.info(
    { requestId, itemsProcessed: 42, durationMs: 12 },
    "Business logic executed successfully"
  );

  return NextResponse.json({
    ok: true,
    requestId,
    message: "Info logs emitted — check Vercel Log Drains or Runtime Logs.",
  });
}
