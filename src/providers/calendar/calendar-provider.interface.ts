import { NormalizedEvent, GetUpcomingEventsInput } from "../../domain/schemas/events.js";

export interface CalendarProvider {
  getUpcomingEvents(input: GetUpcomingEventsInput): Promise<NormalizedEvent[]>;
  getEvent(eventId: string): Promise<NormalizedEvent | undefined>;
}
