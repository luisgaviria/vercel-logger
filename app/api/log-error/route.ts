import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();

  logger.info("Handling error-test request", { requestId });

  try {
    throw new Error("Simulated downstream service failure");
  } catch (err) {
    const error = err as Error;
    logger.error("Unhandled exception caught", {
      requestId,
      errorMessage: error.message,
      stack: error.stack,
      path: request.nextUrl.pathname,
    });

    return NextResponse.json(
      { ok: false, requestId, error: error.message },
      { status: 500 }
    );
  }
}
