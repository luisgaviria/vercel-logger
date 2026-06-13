import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const start = Date.now();

  logger.info({ requestId }, "Slow request started");

  await new Promise((resolve) => setTimeout(resolve, 2000));

  const durationMs = Date.now() - start;

  if (durationMs > 1500) {
    logger.warn(
      { requestId, durationMs, threshold: 1500, path: request.nextUrl.pathname },
      "Slow response detected"
    );
  }

  logger.info({ requestId, durationMs }, "Slow request completed");

  return NextResponse.json({
    ok: true,
    requestId,
    durationMs,
    message: "Slow response with timing warn log emitted.",
  });
}
