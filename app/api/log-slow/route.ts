import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const start = Date.now();

  logger.info("Slow request started", { requestId });

  await new Promise((resolve) => setTimeout(resolve, 2000));

  const durationMs = Date.now() - start;

  if (durationMs > 1500) {
    logger.warn("Slow response detected", {
      requestId,
      durationMs,
      threshold: 1500,
      path: request.nextUrl.pathname,
    });
  }

  logger.info("Slow request completed", { requestId, durationMs });

  return NextResponse.json({
    ok: true,
    requestId,
    durationMs,
    message: "Slow response with timing warn log emitted.",
  });
}
