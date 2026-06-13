import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

// Simulates a deep call chain so Pino captures a meaningful stack trace
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

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const { searchParams } = request.nextUrl;

  // Defaults that intentionally trigger failures:
  //   ?price=abc  → TypeError  (NaN input)
  //   ?discount=999 → RangeError (discount > 100)
  const rawPrice = searchParams.get("price") ?? "abc";
  const rawDiscount = searchParams.get("discount") ?? "10";

  logger.info({ requestId, rawPrice, rawDiscount }, "Processing order request");

  try {
    const finalPrice = processOrder(rawPrice, rawDiscount);
    logger.info({ requestId, finalPrice }, "Order processed successfully");
    return NextResponse.json({ ok: true, requestId, finalPrice });
  } catch (err) {
    // { err } triggers Pino's error serializer: captures name, message, and full stack
    logger.error({ err, requestId, rawPrice, rawDiscount }, "Order processing failed");
    return NextResponse.json(
      { ok: false, requestId, error: (err as Error).message },
      { status: 400 }
    );
  }
}
