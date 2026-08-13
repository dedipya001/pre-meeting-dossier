import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  GetEventContextInputSchema,
  GetUpcomingEventsInputSchema
} from "../../domain/schemas/events.js";
import {
  GetRecentChangesInputSchema,
  SearchActivityInputSchema,
  SearchBusinessRecordsInputSchema,
  SearchConversationsInputSchema,
  SearchDocumentsInputSchema,
  SearchOpenItemsInputSchema,
  SearchOrganizationsInputSchema,
  SearchPeopleInputSchema
} from "../../domain/schemas/search.js";
import { ContextSearchService } from "../../services/context-search.service.js";
import { MeetingResolver } from "../../services/meeting-resolver.service.js";
import { RecentChangesService } from "../../services/recent-changes.service.js";

const jsonContent = (data: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }]
});

export function registerTools(server: McpServer, services: {
  meetingResolver: MeetingResolver;
  contextSearch: ContextSearchService;
  recentChanges: RecentChangesService;
}) {
  server.registerTool("get_upcoming_events", {
    title: "Get upcoming events",
    description: "Returns upcoming meetings and calendar events available to the authenticated user. Use this when identifying which meeting the user is referring to or preparing for an upcoming meeting.",
    inputSchema: GetUpcomingEventsInputSchema
  }, async (input) => jsonContent(await services.meetingResolver.getUpcomingEvents(input)));

  server.registerTool("get_event_context", {
    title: "Get event context",
    description: "Retrieves normalized metadata, attendees, inferred organizations, links, and source references for one calendar event. Use this after selecting a meeting.",
    inputSchema: GetEventContextInputSchema
  }, async (input) => jsonContent(await services.meetingResolver.getEventContext(input.eventId)));

  server.registerTool("search_people", {
    title: "Search people",
    description: "Searches connected sources for people by name, email, organization, or text query and returns normalized people with evidence.",
    inputSchema: SearchPeopleInputSchema
  }, async (input) => jsonContent(await services.contextSearch.searchPeople(input)));

  server.registerTool("search_organizations", {
    title: "Search organizations",
    description: "Searches connected sources for organizations, accounts, domains, aliases, or customer records and returns normalized organization context with evidence.",
    inputSchema: SearchOrganizationsInputSchema
  }, async (input) => jsonContent(await services.contextSearch.searchOrganizations(input)));

  server.registerTool("search_conversations", {
    title: "Search conversations",
    description: "Searches communication history across connected communication providers using participants, organizations, keywords, and dates. Use this to retrieve relevant previous discussion, decisions, questions, requests, and commitments.",
    inputSchema: SearchConversationsInputSchema
  }, async (input) => jsonContent(await services.contextSearch.searchConversations(input)));

  server.registerTool("search_documents", {
    title: "Search documents",
    description: "Searches connected document providers for meeting-relevant files using keywords, organizations, people, and dates. Returns excerpts and source references, not final conclusions.",
    inputSchema: SearchDocumentsInputSchema
  }, async (input) => jsonContent(await services.contextSearch.searchDocuments(input)));

  server.registerTool("search_business_records", {
    title: "Search business records",
    description: "Searches generic business records such as deals, projects, tickets, contracts, proposals, invoices, risks, and requests without exposing provider-specific CRM schemas.",
    inputSchema: SearchBusinessRecordsInputSchema
  }, async (input) => jsonContent(await services.contextSearch.searchBusinessRecords(input)));

  server.registerTool("search_activity", {
    title: "Search activity",
    description: "Finds important historical activity involving organizations, people, projects, records, tickets, meetings, and tasks.",
    inputSchema: SearchActivityInputSchema
  }, async (input) => jsonContent(await services.contextSearch.searchActivity(input)));

  server.registerTool("search_open_items", {
    title: "Search open items",
    description: "Finds unresolved questions, open tasks, pending approvals, tickets, promises, follow-up requests, and other unfinished items relevant to a meeting.",
    inputSchema: SearchOpenItemsInputSchema
  }, async (input) => jsonContent(await services.contextSearch.searchOpenItems(input)));

  server.registerTool("get_recent_changes", {
    title: "Get recent changes",
    description: "Returns material changes involving an organization, people, records, documents, activity, and unresolved items since a specified point in time. Use this when determining what changed since a previous interaction or meeting.",
    inputSchema: GetRecentChangesInputSchema
  }, async (input) => jsonContent(await services.recentChanges.getRecentChanges(input)));
}
