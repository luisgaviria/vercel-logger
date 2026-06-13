import { NextRequest, NextResponse } from "next/server";
import { logger } from "./logger";

interface StackFrame {
  fn: string;
  file: string;
  line: string;
  col: string;
}

// Walks the stack and returns the first frame that belongs to app code,
// skipping Next.js internals and node_modules.
function findOriginFrame(stack: string): StackFrame | null {
  const lines = stack.split("\n").slice(1); // drop the "Error: ..." header line
  for (const line of lines) {
    const match = line.match(/at (.+?) \((.+?):(\d+):(\d+)\)/);
    if (!match) continue;
    const [, fn, file, lineNum, col] = match;
    if (
      file.includes("node_modules") ||
      file.includes("next/dist") ||
      file.includes("<anonymous>")
    ) {
      continue;
    }
    return { fn, file, line: lineNum, col };
  }
  return null;
}

type RouteHandler = (req: NextRequest, ctx: unknown) => Promise<NextResponse>;

export function withErrorLogging(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, ctx: unknown) => {
    const requestId = crypto.randomUUID();
    try {
      return await handler(req, ctx);
    } catch (err) {
      const error = err as Error;
      const origin = findOriginFrame(error.stack ?? "");

      logger.error(
        {
          err,
          requestId,
          path: req.nextUrl.pathname,
          method: req.method,
          // Pinpoints exactly where in the code the error originated
          origin: origin ?? "unknown",
        },
        "Unhandled route error"
      );

      return NextResponse.json(
        {
          ok: false,
          requestId,
          error: error.message,
          // Expose origin in non-production so developers can see it in the UI
          ...(process.env.NODE_ENV !== "production" && { origin }),
        },
        { status: 500 }
      );
    }
  };
}
