import { z } from "zod";
import { PersonRefSchema, SourceReferenceSchema } from "./common.js";

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

export const GetUpcomingEventsInputSchema = z.object({
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(50).default(10),
  query: z.string().optional()
});

export const GetEventContextInputSchema = z.object({
  eventId: z.string()
});

export type NormalizedEvent = z.infer<typeof NormalizedEventSchema>;
export type GetUpcomingEventsInput = z.input<typeof GetUpcomingEventsInputSchema>;
export type GetEventContextInput = z.input<typeof GetEventContextInputSchema>;
