import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  // pino-pretty in dev; raw JSON in production (Vercel log drains expect NDJSON)
  transport:
    process.env.NODE_ENV !== "production"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});

export { logger };
