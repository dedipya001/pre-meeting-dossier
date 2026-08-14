import { z } from "zod";
import { PersonRefSchema, SourceReferenceSchema } from "./common.js";

const OptionalDateTimeSchema = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
}, z.string().datetime().optional());

const LimitSchema = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return value;
}, z.number().int().min(1).max(50).default(10));

export const NormalizedEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  start: z.string().datetime(),
  end: z.string().datetime().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  attendees: z.array(PersonRefSchema).default([]),
  source: z.object({
    provider: z.string(),
    externalId: z.string()
  }),
  links: z.array(z.string().url()).optional(),
  sourceReferences: z.array(SourceReferenceSchema).optional()
});

const RawUpcomingEventsInputSchema = z.object({
  start: OptionalDateTimeSchema,
  end: OptionalDateTimeSchema,
  limit: LimitSchema,
  query: z.string().optional()
});

export const GetUpcomingEventsInputSchema = z.preprocess((value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;

  const input = value as Record<string, unknown>;
  const query = input.query;
  if (typeof query !== "string") return value;

  const trimmed = query.trim();
  if (trimmed === "") return { ...input, query: undefined };
  if (!trimmed.startsWith("{")) return { ...input, query: trimmed };

  try {
    const embedded = JSON.parse(trimmed) as unknown;
    if (!embedded || typeof embedded !== "object" || Array.isArray(embedded)) {
      return { ...input, query: trimmed };
    }
    return { ...input, ...(embedded as Record<string, unknown>) };
  } catch {
    return { ...input, query: trimmed };
  }
}, RawUpcomingEventsInputSchema);

export const GetEventContextInputSchema = z.object({
  eventId: z.string()
});

export type NormalizedEvent = z.infer<typeof NormalizedEventSchema>;
export type GetUpcomingEventsInput = {
  start?: string;
  end?: string;
  limit?: number | string;
  query?: string;
};
export type GetEventContextInput = z.input<typeof GetEventContextInputSchema>;
