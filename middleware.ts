import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const start = Date.now();
  const requestId = crypto.randomUUID();
  const { pathname, search } = request.nextUrl;

  const response = NextResponse.next({
    headers: { "x-request-id": requestId },
  });

  const durationMs = Date.now() - start;

  // Vercel captures console output as structured runtime logs
  console.log(
    JSON.stringify({
      level: "info",
      message: "Incoming request",
      requestId,
      method: request.method,
      path: pathname + search,
      durationMs,
      timestamp: new Date().toISOString(),
    })
  );

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
