import { describe, expect, it } from "vitest";
import { MockProvider } from "../src/providers/mock/mock-provider.js";

describe("MockProvider", () => {
  const provider = new MockProvider();

  it("supports the expected Phase 1 dossier flow", async () => {
    const events = await provider.getUpcomingEvents({ query: "Acme", limit: 5 });
    expect(events[0].title).toBe("CPQ Architecture Review");

    const context = await provider.getEvent(events[0].id);
    expect(context?.attendees.map((a) => a.name)).toContain("Sarah Rao");

    const conversations = await provider.searchConversations({ organization: "Acme Corporation", limit: 10 });
    expect(conversations.some((item) => item.summary.includes("invalid import rows"))).toBe(true);

    const documents = await provider.searchDocuments({ query: "proposal", organization: "Acme", limit: 10 });
    expect(documents[0].sourceReference.sourceType).toBe("document");

    const records = await provider.searchRecords({ organization: "Acme Corporation", limit: 10 });
    expect(records.map((record) => record.type)).toContain("ticket");

    const openItems = await provider.searchOpenItems({ organization: "Acme Corporation", limit: 10 });
    expect(openItems).toHaveLength(2);

    const changes = await provider.getRecentChanges({ organization: "Acme Corporation" });
    expect(changes.map((change) => change.title)).toContain("Proposal V3 uploaded");
  });

  it("returns default upcoming events when Inspector sends an empty input object", async () => {
    const events = await provider.getUpcomingEvents({});
    expect(events).toHaveLength(1);
    expect(events[0].title).toBe("CPQ Architecture Review");
  });
});
