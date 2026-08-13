import { z } from "zod";

export const SourceTypeSchema = z.enum([
  "calendar",
  "conversation",
  "document",
  "crm",
  "task",
  "ticket",
  "project",
  "other"
]);

export const SourceReferenceSchema = z.object({
  provider: z.string(),
  sourceType: SourceTypeSchema,
  externalId: z.string(),
  title: z.string().optional(),
  timestamp: z.string().datetime().optional(),
  url: z.string().url().optional()
});

export const PersonRefSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  organization: z.string().optional()
});

export const OwnerSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional()
});

export const ProviderErrorSchema = z.object({
  provider: z.string(),
  code: z.string(),
  message: z.string()
});

export const ToolEnvelopeSchema = z.object({
  partial: z.boolean().default(false),
  providerErrors: z.array(ProviderErrorSchema).default([])
});

export type SourceReference = z.infer<typeof SourceReferenceSchema>;
export type ProviderError = z.infer<typeof ProviderErrorSchema>;
export type ToolEnvelope = z.infer<typeof ToolEnvelopeSchema>;
