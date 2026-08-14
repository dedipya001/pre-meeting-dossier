import { z } from "zod";
import { OwnerSchema, SourceReferenceSchema } from "./common.js";

export const SearchPeopleInputSchema = z.object({
  query: z.string().optional(),
  names: z.array(z.string()).optional(),
  emails: z.array(z.string().email()).optional(),
  organization: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(10)
});

export const PersonSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  title: z.string().optional(),
  department: z.string().optional(),
  organization: z.string().optional(),
  relationships: z.object({
    type: z.string().optional(),
    description: z.string().optional()
  }).optional(),
  sourceReferences: z.array(SourceReferenceSchema)
});

export const SearchOrganizationsInputSchema = z.object({
  query: z.string(),
  limit: z.number().int().min(1).max(50).default(10)
});

export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  domain: z.string().optional(),
  industry: z.string().optional(),
  description: z.string().optional(),
  relationshipType: z.string().optional(),
  sourceReferences: z.array(SourceReferenceSchema)
});

export const ConversationTypeSchema = z.enum(["email", "chat", "meeting_note", "comment", "support_message", "other"]);

export const SearchConversationsInputSchema = z.object({
  query: z.string().optional(),
  participants: z.array(z.string()).optional(),
  organization: z.string().optional(),
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
  types: z.array(ConversationTypeSchema).optional(),
  limit: z.number().int().min(1).max(50).default(10)
});

export const ConversationItemSchema = z.object({
  id: z.string(),
  type: ConversationTypeSchema,
  title: z.string().optional(),
  timestamp: z.string().datetime(),
  participants: z.array(z.object({ name: z.string().optional(), email: z.string().email().optional() })).optional(),
  summary: z.string(),
  excerpt: z.string().optional(),
  sourceReference: SourceReferenceSchema
});

export const SearchDocumentsInputSchema = z.object({
  query: z.string(),
  organization: z.string().optional(),
  people: z.array(z.string()).optional(),
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(50).default(10)
});

export const DocumentItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.string().optional(),
  updatedAt: z.string().datetime().optional(),
  summary: z.string().optional(),
  matchedContext: z.string().optional(),
  sourceReference: SourceReferenceSchema
});

export const SearchBusinessRecordsInputSchema = z.object({
  organization: z.string().optional(),
  people: z.array(z.string()).optional(),
  query: z.string().optional(),
  recordTypes: z.array(z.string()).optional(),
  status: z.array(z.string()).optional(),
  limit: z.number().int().min(1).max(50).default(10)
});

export const BusinessRecordSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  status: z.string().optional(),
  value: z.object({ amount: z.number().optional(), currency: z.string().optional() }).optional(),
  owner: OwnerSchema.optional(),
  organization: z.string().optional(),
  updatedAt: z.string().datetime().optional(),
  summary: z.string().optional(),
  attributes: z.record(z.string(), z.unknown()).optional(),
  sourceReference: SourceReferenceSchema
});

export const SearchActivityInputSchema = z.object({
  organization: z.string().optional(),
  people: z.array(z.string()).optional(),
  query: z.string().optional(),
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(50).default(10)
});

export const ActivityItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  timestamp: z.string().datetime(),
  organization: z.string().optional(),
  people: z.array(z.string()).optional(),
  summary: z.string().optional(),
  sourceReference: SourceReferenceSchema
});

export const SearchOpenItemsInputSchema = z.object({
  organization: z.string().optional(),
  people: z.array(z.string()).optional(),
  eventId: z.string().optional(),
  query: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(10)
});

export const OpenItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  status: z.string().optional(),
  dueAt: z.string().datetime().optional(),
  owner: OwnerSchema.optional(),
  summary: z.string().optional(),
  sourceReference: SourceReferenceSchema
});

export const GetRecentChangesInputSchema = z.object({
  organization: z.string().optional(),
  people: z.array(z.string()).optional(),
  since: z.string().datetime().optional(),
  eventId: z.string().optional()
});

export const ChangeItemSchema = z.object({
  type: z.string(),
  timestamp: z.string().datetime(),
  title: z.string(),
  description: z.string(),
  importance: z.enum(["low", "medium", "high"]),
  sourceReference: SourceReferenceSchema
});

export type SearchPeopleInput = z.input<typeof SearchPeopleInputSchema>;
export type Person = z.infer<typeof PersonSchema>;
export type SearchOrganizationsInput = z.input<typeof SearchOrganizationsInputSchema>;
export type Organization = z.infer<typeof OrganizationSchema>;
export type SearchConversationsInput = z.input<typeof SearchConversationsInputSchema>;
export type ConversationItem = z.infer<typeof ConversationItemSchema>;
export type SearchDocumentsInput = z.input<typeof SearchDocumentsInputSchema>;
export type DocumentItem = z.infer<typeof DocumentItemSchema>;
export type SearchBusinessRecordsInput = z.input<typeof SearchBusinessRecordsInputSchema>;
export type BusinessRecord = z.infer<typeof BusinessRecordSchema>;
export type SearchActivityInput = z.input<typeof SearchActivityInputSchema>;
export type ActivityItem = z.infer<typeof ActivityItemSchema>;
export type SearchOpenItemsInput = z.input<typeof SearchOpenItemsInputSchema>;
export type OpenItem = z.infer<typeof OpenItemSchema>;
export type GetRecentChangesInput = z.input<typeof GetRecentChangesInputSchema>;
export type ChangeItem = z.infer<typeof ChangeItemSchema>;
