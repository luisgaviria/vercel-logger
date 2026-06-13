import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();

  logger.info({ requestId }, "Handling warn request");

  logger.warn(
    {
      requestId,
      path: request.nextUrl.pathname,
      recommendation: "Use /api/log-info instead",
    },
    "Deprecated endpoint called"
  );

  logger.warn(
    { requestId, currentRpm: 480, limitRpm: 500 },
    "Rate limit threshold approaching"
  );

  return NextResponse.json({ ok: true, requestId, message: "Warning logs emitted." });
}
