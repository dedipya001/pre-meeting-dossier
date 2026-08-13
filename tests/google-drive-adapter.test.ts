import { describe, expect, it } from "vitest";
import { StaticAccessTokenProvider } from "../src/auth/access-token-provider.js";
import { GoogleDriveAdapter } from "../src/providers/documents/google-drive.adapter.js";

describe("GoogleDriveAdapter", () => {
  it("searches files and normalizes document results", async () => {
    const adapter = new GoogleDriveAdapter({
      tokenProvider: new StaticAccessTokenProvider("token"),
      fetchImpl: async (url, init) => {
        expect(String(url)).toContain("/drive/v3/files?");
        expect(init?.headers).toMatchObject({ authorization: "Bearer token" });
        return new Response(JSON.stringify({
          files: [{
            id: "doc-1",
            name: "Acme CPQ Proposal V3",
            mimeType: "application/vnd.google-apps.document",
            modifiedTime: "2026-08-12T11:30:00.000Z",
            webViewLink: "https://drive.google.com/doc-1",
            description: "Proposal update"
          }]
        }), { status: 200 });
      }
    });

    const documents = await adapter.searchDocuments({ query: "Acme", limit: 5 });
    expect(documents[0]).toMatchObject({
      id: "google-drive:doc-1",
      title: "Acme CPQ Proposal V3",
      sourceReference: { provider: "google-drive", sourceType: "document", externalId: "doc-1" }
    });
  });
});
