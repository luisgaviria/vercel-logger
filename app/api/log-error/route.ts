import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();

  logger.info({ requestId }, "Handling error-test request");

  try {
    throw new Error("Simulated downstream service failure");
  } catch (err) {
    // Pino's built-in err serializer captures name, message, and stack automatically
    logger.error(
      { err, requestId, path: request.nextUrl.pathname },
      "Unhandled exception caught"
    );

    return NextResponse.json(
      { ok: false, requestId, error: (err as Error).message },
      { status: 500 }
    );
  }
}
