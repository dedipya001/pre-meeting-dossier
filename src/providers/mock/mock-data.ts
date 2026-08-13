import { NormalizedEvent } from "../../domain/schemas/events.js";
import { ActivityItem, BusinessRecord, ChangeItem, ConversationItem, DocumentItem, OpenItem, Organization, Person } from "../../domain/schemas/search.js";

export const mockPeople: Person[] = [
  {
    id: "person-john-smith-acme",
    name: "John Smith",
    email: "john.smith@acme.com",
    title: "VP Sales",
    department: "Revenue",
    organization: "Acme Corporation",
    relationships: { type: "customer stakeholder", description: "Primary commercial sponsor for CPQ onboarding." },
    sourceReferences: [{ provider: "mock-enterprise", sourceType: "other", externalId: "contact-john", title: "Acme contact record" }]
  },
  {
    id: "person-sarah-rao-acme",
    name: "Sarah Rao",
    email: "sarah.rao@acme.com",
    title: "Solutions Architect",
    department: "Architecture",
    organization: "Acme Corporation",
    relationships: { type: "technical evaluator", description: "Owns validation and import architecture questions." },
    sourceReferences: [{ provider: "mock-enterprise", sourceType: "other", externalId: "contact-sarah", title: "Acme contact record" }]
  }
];

export const mockOrganizations: Organization[] = [
  {
    id: "org-acme",
    name: "Acme Corporation",
    domain: "acme.com",
    industry: "Manufacturing",
    description: "Customer evaluating CPQ catalog automation and bulk onboarding.",
    relationshipType: "customer",
    sourceReferences: [{ provider: "mock-enterprise", sourceType: "crm", externalId: "account-acme", title: "Acme account" }]
  }
];

export const mockEvents: NormalizedEvent[] = [
  {
    id: "event-acme-cpq-architecture-review",
    title: "CPQ Architecture Review",
    start: "2026-08-14T14:00:00.000Z",
    end: "2026-08-14T15:00:00.000Z",
    location: "Google Meet",
    description: "Review CPQ onboarding architecture, mapping behavior, validation, and POC timeline.",
    attendees: mockPeople.map(({ id, name, email, organization }) => ({ id, name, email, organization })),
    links: ["https://meet.example.com/acme-cpq-review"],
    source: { provider: "mock-calendar", externalId: "cal-evt-1001" },
    sourceReferences: [{ provider: "mock-calendar", sourceType: "calendar", externalId: "cal-evt-1001", title: "CPQ Architecture Review", timestamp: "2026-08-14T14:00:00.000Z" }]
  }
];

export const mockConversations: ConversationItem[] = [
  {
    id: "conv-bulk-onboarding",
    type: "email",
    title: "Excel bulk onboarding requirements",
    timestamp: "2026-08-07T16:20:00.000Z",
    participants: [{ name: "John Smith", email: "john.smith@acme.com" }],
    summary: "Customer requested Excel bulk catalog onboarding and asked whether automatic field mapping can reduce setup time.",
    excerpt: "Bulk onboarding is the blocker for rollout; reusable mappings would help.",
    sourceReference: { provider: "mock-communications", sourceType: "conversation", externalId: "email-100", title: "Excel bulk onboarding requirements", timestamp: "2026-08-07T16:20:00.000Z" }
  },
  {
    id: "conv-invalid-rows",
    type: "meeting_note",
    title: "Validation handling follow-up",
    timestamp: "2026-08-10T18:10:00.000Z",
    participants: [{ name: "Sarah Rao", email: "sarah.rao@acme.com" }],
    summary: "Sarah raised concern about invalid import rows and asked whether bad rows should block the entire import.",
    excerpt: "Need clarity on partial success, row-level errors, and ownership of source data fixes.",
    sourceReference: { provider: "mock-communications", sourceType: "conversation", externalId: "note-210", title: "Validation handling follow-up", timestamp: "2026-08-10T18:10:00.000Z" }
  }
];

export const mockDocuments: DocumentItem[] = [
  {
    id: "doc-proposal-v3",
    title: "Acme CPQ Proposal V3",
    type: "proposal",
    updatedAt: "2026-08-12T11:30:00.000Z",
    summary: "Updated proposal adds a CPQ onboarding POC and moves the validation architecture decision into the first milestone.",
    matchedContext: "Proposal V3 references Excel imports, automatic mapping, and validation error handling.",
    sourceReference: { provider: "mock-documents", sourceType: "document", externalId: "drive-doc-300", title: "Acme CPQ Proposal V3", timestamp: "2026-08-12T11:30:00.000Z" }
  }
];

export const mockBusinessRecords: BusinessRecord[] = [
  {
    id: "record-cpq-project",
    type: "project",
    title: "Catalog Automation",
    status: "Architecture Review",
    organization: "Acme Corporation",
    updatedAt: "2026-08-12T12:00:00.000Z",
    summary: "Project is focused on bulk catalog onboarding, reusable mappings, and validation behavior.",
    attributes: { milestone: "POC", previousDeadline: "2026-09-01", currentDeadline: "2026-09-08" },
    sourceReference: { provider: "mock-business", sourceType: "project", externalId: "project-500", title: "Catalog Automation", timestamp: "2026-08-12T12:00:00.000Z" }
  },
  {
    id: "record-implementation-ticket",
    type: "ticket",
    title: "Define invalid-row handling",
    status: "open",
    owner: { name: "Sarah Rao", email: "sarah.rao@acme.com" },
    organization: "Acme Corporation",
    updatedAt: "2026-08-12T15:00:00.000Z",
    summary: "New implementation ticket asks whether invalid rows block all import processing or fail row-by-row.",
    sourceReference: { provider: "mock-business", sourceType: "ticket", externalId: "ticket-880", title: "Define invalid-row handling", timestamp: "2026-08-12T15:00:00.000Z" }
  }
];

export const mockActivity: ActivityItem[] = [
  {
    id: "activity-prev-meeting",
    type: "meeting",
    title: "Previous Acme discovery call",
    timestamp: "2026-08-06T17:00:00.000Z",
    organization: "Acme Corporation",
    people: ["John Smith"],
    summary: "Acme confirmed bulk onboarding and automatic field mapping as the main requirements.",
    sourceReference: { provider: "mock-calendar", sourceType: "calendar", externalId: "cal-evt-0990", title: "Previous Acme discovery call", timestamp: "2026-08-06T17:00:00.000Z" }
  }
];

export const mockOpenItems: OpenItem[] = [
  {
    id: "open-validation-architecture",
    type: "open task",
    title: "Provide validation architecture",
    status: "open",
    dueAt: "2026-08-14T14:00:00.000Z",
    owner: { name: "Demo User", email: "demo@example.com" },
    summary: "You committed to explain validation, row-level errors, and import rollback behavior.",
    sourceReference: { provider: "mock-tasks", sourceType: "task", externalId: "task-700", title: "Provide validation architecture", timestamp: "2026-08-10T18:15:00.000Z" }
  },
  {
    id: "open-source-data-owner",
    type: "unanswered question",
    title: "Confirm source-data ownership",
    status: "waiting_on_customer",
    owner: { name: "John Smith", email: "john.smith@acme.com" },
    summary: "Acme needs to confirm who owns cleanup of invalid source rows before import.",
    sourceReference: { provider: "mock-communications", sourceType: "conversation", externalId: "note-210", title: "Validation handling follow-up", timestamp: "2026-08-10T18:10:00.000Z" }
  }
];

export const mockChanges: ChangeItem[] = [
  {
    type: "document_updated",
    timestamp: "2026-08-12T11:30:00.000Z",
    title: "Proposal V3 uploaded",
    description: "Acme CPQ Proposal V3 was updated with POC scope and validation architecture as a first milestone.",
    importance: "high",
    sourceReference: mockDocuments[0].sourceReference
  },
  {
    type: "participant_added",
    timestamp: "2026-08-12T13:00:00.000Z",
    title: "Sarah Rao added to the meeting",
    description: "Sarah Rao, Acme's Solutions Architect, is now an attendee for the architecture review.",
    importance: "medium",
    sourceReference: mockEvents[0].sourceReferences![0]
  },
  {
    type: "ticket_created",
    timestamp: "2026-08-12T15:00:00.000Z",
    title: "New implementation ticket created",
    description: "A ticket was created to decide invalid-row handling for bulk imports.",
    importance: "high",
    sourceReference: mockBusinessRecords[1].sourceReference
  },
  {
    type: "deadline_changed",
    timestamp: "2026-08-12T16:30:00.000Z",
    title: "POC deadline changed",
    description: "POC deadline moved from 2026-09-01 to 2026-09-08.",
    importance: "medium",
    sourceReference: mockBusinessRecords[0].sourceReference
  }
];
