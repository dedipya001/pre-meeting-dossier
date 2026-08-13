import { describe, expect, it } from "vitest";
import { StaticAccessTokenProvider } from "../src/auth/access-token-provider.js";
import { GmailAdapter } from "../src/providers/communications/gmail.adapter.js";

describe("GmailAdapter", () => {
  it("searches messages and normalizes conversations", async () => {
    const adapter = new GmailAdapter({
      tokenProvider: new StaticAccessTokenProvider("token"),
      fetchImpl: async (url) => {
        if (String(url).includes("/messages?")) {
          expect(String(url)).toContain("Acme");
          return new Response(JSON.stringify({ messages: [{ id: "msg-1", threadId: "th-1" }] }), { status: 200 });
        }
        return new Response(JSON.stringify({
          id: "msg-1",
          threadId: "th-1",
          snippet: "Sarah asked about invalid rows.",
          internalDate: String(new Date("2026-08-12T10:00:00.000Z").getTime()),
          payload: {
            headers: [
              { name: "Subject", value: "Validation handling" },
              { name: "From", value: "Sarah Rao <sarah.rao@acme.com>" },
              { name: "To", value: "Demo User <demo@example.com>" }
            ]
          }
        }), { status: 200 });
      }
    });

    const items = await adapter.searchConversations({ query: "Acme", limit: 5 });
    expect(items[0]).toMatchObject({
      id: "gmail:msg-1",
      type: "email",
      title: "Validation handling",
      summary: "Sarah asked about invalid rows."
    });
    expect(items[0].participants?.[0]).toMatchObject({ name: "Sarah Rao", email: "sarah.rao@acme.com" });
  });
});
