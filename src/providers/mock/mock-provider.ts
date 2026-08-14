import { BaseProvider } from "../provider.interface.js";
import { CalendarProvider } from "../calendar/calendar-provider.interface.js";
import { CommunicationProvider } from "../communications/communication-provider.interface.js";
import { DocumentProvider } from "../documents/document-provider.interface.js";
import { BusinessRecordProvider } from "../business-records/business-provider.interface.js";
import { ActivityProvider, ChangeProvider, OpenItemsProvider } from "../tasks/task-provider.interface.js";
import { GetUpcomingEventsInput, NormalizedEvent } from "../../domain/schemas/events.js";
import {
  ActivityItem,
  BusinessRecord,
  ChangeItem,
  ConversationItem,
  DocumentItem,
  GetRecentChangesInput,
  OpenItem,
  Organization,
  Person,
  SearchActivityInput,
  SearchBusinessRecordsInput,
  SearchConversationsInput,
  SearchDocumentsInput,
  SearchOpenItemsInput,
  SearchOrganizationsInput,
  SearchPeopleInput
} from "../../domain/schemas/search.js";
import { anyIncludes, byRecency, includesText, withinRange } from "../../utils/search.js";
import { mockActivity, mockBusinessRecords, mockChanges, mockConversations, mockDocuments, mockEvents, mockOpenItems, mockOrganizations, mockPeople } from "./mock-data.js";

export class MockProvider implements BaseProvider, CalendarProvider, CommunicationProvider, DocumentProvider, BusinessRecordProvider, ActivityProvider, OpenItemsProvider, ChangeProvider {
  metadata = {
    id: "mock-enterprise",
    displayName: "Mock Enterprise",
    capabilities: ["calendar", "communications", "documents", "people", "organizations", "business_records", "activity", "open_items", "changes"] as const
  };

  async getUpcomingEvents(input: GetUpcomingEventsInput): Promise<NormalizedEvent[]> {
    return byRecency(mockEvents)
      .filter((event) => withinRange(event.start, input.start, input.end))
      .filter((event) => anyIncludes([event.title, event.description, ...event.attendees.map((a) => a.name), ...event.attendees.map((a) => a.organization)], input.query))
      .slice(0, input.limit ?? 10);
  }

  async getEvent(eventId: string): Promise<NormalizedEvent | undefined> {
    return mockEvents.find((event) => event.id === eventId || event.source.externalId === eventId);
  }

  async searchPeople(input: SearchPeopleInput): Promise<Person[]> {
    return mockPeople
      .filter((person) => !input.organization || includesText(person.organization, input.organization))
      .filter((person) => !input.query || anyIncludes([person.name, person.email, person.title, person.organization], input.query))
      .filter((person) => !input.names?.length || input.names.some((name) => includesText(person.name, name)))
      .filter((person) => !input.emails?.length || input.emails.includes(person.email ?? ""))
      .slice(0, input.limit ?? 10);
  }

  async searchOrganizations(input: SearchOrganizationsInput): Promise<Organization[]> {
    return mockOrganizations
      .filter((org) => anyIncludes([org.name, org.domain, org.description], input.query))
      .slice(0, input.limit ?? 10);
  }

  async searchConversations(input: SearchConversationsInput): Promise<ConversationItem[]> {
    return byRecency(mockConversations)
      .filter((item) => withinRange(item.timestamp, input.start, input.end))
      .filter((item) => !input.types?.length || input.types.includes(item.type))
      .filter((item) => !input.organization || item.participants?.some((p) => p.email?.endsWith("@acme.com")) || includesText(item.summary, input.organization))
      .filter((item) => !input.participants?.length || input.participants.some((p) => anyIncludes([item.title, item.summary, ...(item.participants ?? []).flatMap((x) => [x.name, x.email])], p)))
      .filter((item) => !input.query || anyIncludes([item.title, item.summary, item.excerpt], input.query))
      .slice(0, input.limit ?? 10);
  }

  async searchDocuments(input: SearchDocumentsInput): Promise<DocumentItem[]> {
    return byRecency(mockDocuments)
      .filter((doc) => withinRange(doc.updatedAt, input.start, input.end))
      .filter((doc) => !input.organization || anyIncludes([doc.title, doc.summary, doc.matchedContext], input.organization))
      .filter((doc) => !input.people?.length || input.people.some((person) => anyIncludes([doc.title, doc.summary, doc.matchedContext], person)))
      .filter((doc) => anyIncludes([doc.title, doc.summary, doc.matchedContext], input.query))
      .slice(0, input.limit ?? 10);
  }

  async searchRecords(input: SearchBusinessRecordsInput): Promise<BusinessRecord[]> {
    return byRecency(mockBusinessRecords)
      .filter((record) => !input.organization || includesText(record.organization, input.organization))
      .filter((record) => !input.recordTypes?.length || input.recordTypes.includes(record.type))
      .filter((record) => !input.status?.length || input.status.includes(record.status ?? ""))
      .filter((record) => !input.query || anyIncludes([record.title, record.summary, record.type, record.status], input.query))
      .slice(0, input.limit ?? 10);
  }

  async searchActivity(input: SearchActivityInput): Promise<ActivityItem[]> {
    return byRecency(mockActivity)
      .filter((item) => withinRange(item.timestamp, input.start, input.end))
      .filter((item) => !input.organization || includesText(item.organization, input.organization))
      .filter((item) => !input.people?.length || input.people.some((person) => item.people?.some((p) => includesText(p, person))))
      .filter((item) => !input.query || anyIncludes([item.title, item.summary, item.type], input.query))
      .slice(0, input.limit ?? 10);
  }

  async searchOpenItems(input: SearchOpenItemsInput): Promise<OpenItem[]> {
    return mockOpenItems
      .filter((item) => !input.query || anyIncludes([item.title, item.summary, item.type, item.status], input.query))
      .filter((item) => !input.people?.length || input.people.some((person) => anyIncludes([item.owner?.name, item.owner?.email, item.summary], person)))
      .slice(0, input.limit ?? 10);
  }

  async getRecentChanges(input: GetRecentChangesInput): Promise<ChangeItem[]> {
    return byRecency(mockChanges)
      .filter((change) => !input.since || new Date(change.timestamp).getTime() >= new Date(input.since).getTime())
      .filter((change) => !input.organization || input.organization.toLowerCase().includes("acme") || anyIncludes([change.title, change.description], input.organization))
      .filter((change) => !input.people?.length || input.people.some((person) => anyIncludes([change.title, change.description], person)));
  }
}
