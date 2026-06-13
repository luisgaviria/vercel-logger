import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { withErrorLogging } from "@/lib/with-error-logging";

function parseUserInput(raw: string): number {
  const value = Number(raw);
  if (isNaN(value)) {
    throw new TypeError(`Invalid numeric input: "${raw}"`);
  }
  return value;
}

function computeDiscount(price: number, discountPct: number): number {
  if (discountPct > 100) {
    throw new RangeError(`Discount ${discountPct}% exceeds 100%`);
  }
  return price * (1 - discountPct / 100);
}

function processOrder(rawPrice: string, rawDiscount: string) {
  const price = parseUserInput(rawPrice);
  const discount = parseUserInput(rawDiscount);
  return computeDiscount(price, discount);
}

async function handler(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const rawPrice = searchParams.get("price") ?? "abc";
  const rawDiscount = searchParams.get("discount") ?? "10";

  logger.info({ rawPrice, rawDiscount }, "Processing order request");

  // No try/catch — withErrorLogging intercepts, parses the stack, and logs the origin
  const finalPrice = processOrder(rawPrice, rawDiscount);

  logger.info({ finalPrice }, "Order processed successfully");
  return NextResponse.json({ ok: true, finalPrice });
}

export const GET = withErrorLogging(handler);
