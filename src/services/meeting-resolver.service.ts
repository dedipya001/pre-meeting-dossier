import { GetUpcomingEventsInput, NormalizedEvent } from "../domain/schemas/events.js";
import { CalendarProvider } from "../providers/calendar/calendar-provider.interface.js";
import { BaseProvider } from "../providers/provider.interface.js";
import { ProviderRegistry } from "./provider-registry.service.js";
import { runProviders } from "./provider-runner.service.js";
import { byRecency, dedupeById } from "../utils/search.js";

type CalendarCapableProvider = BaseProvider & CalendarProvider;

export class MeetingResolver {
  constructor(private readonly registry: ProviderRegistry) {}

  async getUpcomingEvents(input: GetUpcomingEventsInput) {
    const providers = this.registry.findByCapability<CalendarCapableProvider>("calendar");
    const result = await runProviders(providers, (provider) => provider.getUpcomingEvents(input));
    return {
      events: byRecency(dedupeById(result.items)).slice(0, input.limit),
      partial: result.partial,
      providerErrors: result.providerErrors
    };
  }

  async getEventContext(eventId: string) {
    const providers = this.registry.findByCapability<CalendarCapableProvider>("calendar");
    const result = await runProviders(providers, async (provider) => {
      const event = await provider.getEvent(eventId);
      return event ? [event] : [];
    });
    const event = result.items[0];
    const organizations = [...new Set(event?.attendees.map((attendee) => attendee.organization).filter(Boolean) ?? [])];

    return {
      event,
      attendees: event?.attendees ?? [],
      inferredOrganizations: organizations,
      links: event?.links ?? [],
      sourceReferences: event?.sourceReferences ?? [],
      partial: result.partial,
      providerErrors: result.providerErrors
    };
  }

  resolveNaturalReference(events: NormalizedEvent[], reference: string): { event?: NormalizedEvent; ambiguities?: NormalizedEvent[] } {
    const query = reference.toLowerCase();
    const matches = events.filter((event) => {
      const haystack = [event.title, event.description, ...event.attendees.flatMap((a) => [a.name, a.email, a.organization])].join(" ").toLowerCase();
      return haystack.includes(query.replace(/next|meeting|tomorrow|with|my|call/g, "").trim());
    });
    if (matches.length === 1) return { event: matches[0] };
    if (matches.length > 1) return { ambiguities: matches };
    return { event: events[0] };
  }
}
