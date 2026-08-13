import { GetUpcomingEventsInput, NormalizedEvent } from "../../domain/schemas/events.js";
import { AccessTokenProvider } from "../../auth/access-token-provider.js";
import { CalendarProvider } from "./calendar-provider.interface.js";
import { BaseProvider } from "../provider.interface.js";

type GoogleCalendarEvent = {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  htmlLink?: string;
  start?: { dateTime?: string; date?: string; timeZone?: string };
  end?: { dateTime?: string; date?: string; timeZone?: string };
  attendees?: Array<{
    id?: string;
    email?: string;
    displayName?: string;
    organizer?: boolean;
    self?: boolean;
  }>;
  organizer?: { email?: string; displayName?: string };
  creator?: { email?: string; displayName?: string };
  updated?: string;
};

type GoogleCalendarEventsResponse = {
  items?: GoogleCalendarEvent[];
};

export type GoogleCalendarAdapterOptions = {
  calendarId: string;
  tokenProvider: AccessTokenProvider;
  fetchImpl?: typeof fetch;
};

export class GoogleCalendarAdapter implements BaseProvider, CalendarProvider {
  metadata = {
    id: "google-calendar",
    displayName: "Google Calendar",
    capabilities: ["calendar"] as const
  };

  private readonly fetchImpl: typeof fetch;

  constructor(private readonly options: GoogleCalendarAdapterOptions) {
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async getUpcomingEvents(input: GetUpcomingEventsInput): Promise<NormalizedEvent[]> {
    const now = new Date().toISOString();
    const params = new URLSearchParams({
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: String(input.limit),
      timeMin: input.start ?? now
    });

    if (input.end) params.set("timeMax", input.end);
    if (input.query) params.set("q", input.query);

    const response = await this.request<GoogleCalendarEventsResponse>(`/calendars/${encodeURIComponent(this.options.calendarId)}/events?${params}`);
    return (response.items ?? []).map((event) => this.normalizeEvent(event));
  }

  async getEvent(eventId: string): Promise<NormalizedEvent | undefined> {
    const externalId = eventId.startsWith("google-calendar:") ? eventId.slice("google-calendar:".length) : eventId;
    const event = await this.request<GoogleCalendarEvent>(`/calendars/${encodeURIComponent(this.options.calendarId)}/events/${encodeURIComponent(externalId)}`);
    return this.normalizeEvent(event);
  }

  private async request<T>(path: string): Promise<T> {
    const accessToken = await this.options.tokenProvider.getAccessToken();
    const response = await this.fetchImpl(`https://www.googleapis.com/calendar/v3${path}`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
        accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Google Calendar request failed with ${response.status}`);
    }

    return await response.json() as T;
  }

  private normalizeEvent(event: GoogleCalendarEvent): NormalizedEvent {
    const start = event.start?.dateTime ?? dateOnlyToIso(event.start?.date);
    if (!start) {
      throw new Error(`Google Calendar event ${event.id} is missing a start time`);
    }

    const end = event.end?.dateTime ?? dateOnlyToIso(event.end?.date);
    const title = event.summary || "(Untitled event)";
    const attendees = (event.attendees ?? []).map((attendee) => ({
      id: attendee.id,
      name: attendee.displayName,
      email: attendee.email,
      organization: organizationFromEmail(attendee.email)
    }));

    return {
      id: `google-calendar:${event.id}`,
      title,
      start,
      end,
      location: event.location,
      description: event.description,
      attendees,
      links: event.htmlLink ? [event.htmlLink] : undefined,
      source: {
        provider: "google-calendar",
        externalId: event.id
      },
      sourceReferences: [{
        provider: "google-calendar",
        sourceType: "calendar",
        externalId: event.id,
        title,
        timestamp: start,
        url: event.htmlLink
      }]
    };
  }
}

function dateOnlyToIso(date: string | undefined): string | undefined {
  return date ? `${date}T00:00:00.000Z` : undefined;
}

function organizationFromEmail(email: string | undefined): string | undefined {
  const domain = email?.split("@")[1]?.toLowerCase();
  if (!domain) return undefined;
  const generic = new Set(["gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com"]);
  if (generic.has(domain)) return undefined;
  const label = domain.split(".")[0];
  return label ? `${label[0].toUpperCase()}${label.slice(1)}` : undefined;
}
