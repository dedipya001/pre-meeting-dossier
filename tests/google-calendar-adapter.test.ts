import { describe, expect, it } from "vitest";
import { GoogleCalendarAdapter } from "../src/providers/calendar/google-calendar.adapter.js";
import { StaticAccessTokenProvider } from "../src/auth/access-token-provider.js";

describe("GoogleCalendarAdapter", () => {
  it("maps Google Calendar events to normalized events with evidence", async () => {
    const adapter = new GoogleCalendarAdapter({
      calendarId: "primary",
      tokenProvider: new StaticAccessTokenProvider("test-token"),
      fetchImpl: async (url, init) => {
        expect(String(url)).toContain("timeMin=2026-08-14T00%3A00%3A00.000Z");
        expect(String(url)).toContain("q=Acme");
        expect(init?.headers).toMatchObject({ authorization: "Bearer test-token" });
        return new Response(JSON.stringify({
          items: [{
            id: "evt-1",
            summary: "CPQ Architecture Review",
            description: "Review validation architecture",
            location: "Google Meet",
            htmlLink: "https://calendar.google.com/event?eid=evt-1",
            start: { dateTime: "2026-08-14T14:00:00.000Z" },
            end: { dateTime: "2026-08-14T15:00:00.000Z" },
            attendees: [
              { email: "john.smith@acme.com", displayName: "John Smith" }
            ]
          }]
        }), { status: 200, headers: { "content-type": "application/json" } });
      }
    });

    const events = await adapter.getUpcomingEvents({
      query: "Acme",
      start: "2026-08-14T00:00:00.000Z",
      limit: 5
    });

    expect(events[0]).toMatchObject({
      id: "google-calendar:evt-1",
      title: "CPQ Architecture Review",
      source: { provider: "google-calendar", externalId: "evt-1" }
    });
    expect(events[0].attendees[0]).toMatchObject({
      name: "John Smith",
      email: "john.smith@acme.com",
      organization: "Acme"
    });
    expect(events[0].sourceReferences?.[0]).toMatchObject({
      provider: "google-calendar",
      sourceType: "calendar",
      externalId: "evt-1"
    });
  });

  it("fetches one event by normalized or external id", async () => {
    const adapter = new GoogleCalendarAdapter({
      calendarId: "team-calendar",
      tokenProvider: new StaticAccessTokenProvider("test-token"),
      fetchImpl: async (url) => {
        expect(String(url)).toContain("/calendars/team-calendar/events/evt-2");
        return new Response(JSON.stringify({
          id: "evt-2",
          summary: "Architecture Review",
          start: { date: "2026-08-15" }
        }), { status: 200, headers: { "content-type": "application/json" } });
      }
    });

    const event = await adapter.getEvent("google-calendar:evt-2");
    expect(event?.start).toBe("2026-08-15T00:00:00.000Z");
  });
});
