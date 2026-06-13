import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();

  logger.info("Handling warn request", { requestId });

  logger.warn("Deprecated endpoint called", {
    requestId,
    path: request.nextUrl.pathname,
    recommendation: "Use /api/log-info instead",
  });

  logger.warn("Rate limit threshold approaching", {
    requestId,
    currentRpm: 480,
    limitRpm: 500,
  });

  return NextResponse.json({
    ok: true,
    requestId,
    message: "Warning logs emitted.",
  });
}
