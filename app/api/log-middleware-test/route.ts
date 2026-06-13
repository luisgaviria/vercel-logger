import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { withErrorLogging } from "@/lib/with-error-logging";

// Each scenario is a named function so the stack trace shows a meaningful fn name

function triggerTypeError() {
  const obj = null as unknown as { name: string };
  return obj.name; // TypeError: Cannot read properties of null
}

function triggerRangeError() {
  // eslint-disable-next-line @typescript-eslint/no-array-constructor
  return new Array(-1); // RangeError: Invalid array length
}

function triggerSyntaxError() {
  return JSON.parse("{ invalid json }"); // SyntaxError
}

class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly query: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

function triggerCustomError() {
  throw new DatabaseError(
    "Connection pool exhausted",
    "SELECT * FROM orders WHERE user_id = ?",
    "ECONNREFUSED"
  );
}

async function triggerAsyncError() {
  await new Promise<void>((_, reject) =>
    setTimeout(() => reject(new Error("Async job timed out after 5000ms")), 50)
  );
}

const SCENARIOS: Record<string, () => unknown> = {
  type: triggerTypeError,
  range: triggerRangeError,
  syntax: triggerSyntaxError,
  custom: triggerCustomError,
  async: triggerAsyncError,
};

async function handler(request: NextRequest): Promise<NextResponse> {
  const scenario = request.nextUrl.searchParams.get("scenario");

  if (!scenario) {
    return NextResponse.json({
      ok: true,
      available: Object.keys(SCENARIOS),
      usage: "/api/log-middleware-test?scenario=<name>",
    });
  }

  const fn = SCENARIOS[scenario];
  if (!fn) {
    return NextResponse.json(
      { ok: false, error: `Unknown scenario "${scenario}"`, available: Object.keys(SCENARIOS) },
      { status: 400 }
    );
  }

  logger.info({ scenario }, "Running error scenario");

  // All throws bubble up to withErrorLogging — no try/catch here
  await fn();

  return NextResponse.json({ ok: true, scenario });
}

export const GET = withErrorLogging(handler);
