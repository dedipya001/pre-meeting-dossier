import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default("0.0.0.0"),
  LOG_LEVEL: z.string().default("info"),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  SECRET_ENCRYPTION_KEY: z.string().optional(),
  MOCK_PROVIDER_ENABLED: z.coerce.boolean().default(true),
  GOOGLE_CALENDAR_ENABLED: z.coerce.boolean().default(false),
  GOOGLE_CALENDAR_ACCESS_TOKEN: z.string().optional(),
  GOOGLE_CALENDAR_ID: z.string().default("primary"),
  GMAIL_ENABLED: z.coerce.boolean().default(false),
  GMAIL_ACCESS_TOKEN: z.string().optional(),
  GOOGLE_DRIVE_ENABLED: z.coerce.boolean().default(false),
  GOOGLE_DRIVE_ACCESS_TOKEN: z.string().optional(),
  GOOGLE_OAUTH_CLIENT_ID: z.string().optional(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().optional(),
  GOOGLE_OAUTH_REDIRECT_URI: z.string().optional(),
  APP_JWT_SECRET: z.string().default("dev-only-change-me"),
  MCP_REQUIRE_AUTH: z.coerce.boolean().default(false),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
  RATE_LIMIT_WINDOW: z.string().default("1 minute")
});

export const env = EnvSchema.parse(process.env);
