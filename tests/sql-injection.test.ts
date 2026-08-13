import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { StaticAccessTokenProvider } from "../src/auth/access-token-provider.js";
import { GoogleDriveAdapter } from "../src/providers/documents/google-drive.adapter.js";
import { GmailAdapter } from "../src/providers/communications/gmail.adapter.js";

describe("SQL injection guardrails", () => {
  it("does not use unsafe Prisma raw query APIs", () => {
    const root = resolve(import.meta.dirname, "..");
    const files = [
      "src/database/prisma.ts",
      "src/services/context-search.service.ts",
      "src/services/meeting-resolver.service.ts",
      "src/services/recent-changes.service.ts"
    ];
    const source = files.map((file) => readFileSync(resolve(root, file), "utf8")).join("\n");
    expect(source).not.toMatch(/\$queryRawUnsafe|\$executeRawUnsafe/);
  });

  it("escapes quote characters in Google Drive query input", async () => {
    const malicious = "Acme' or name contains 'secret";
    const adapter = new GoogleDriveAdapter({
      tokenProvider: new StaticAccessTokenProvider("token"),
      fetchImpl: async (url) => {
        const q = new URL(String(url)).searchParams.get("q");
        expect(q).toContain("Acme\\' or name contains \\'secret");
        return new Response(JSON.stringify({ files: [] }), { status: 200 });
      }
    });

    await adapter.searchDocuments({ query: malicious, limit: 5 });
  });

  it("URL-encodes Gmail search input instead of interpolating request paths unsafely", async () => {
    const malicious = "Acme after:1970/01/01 { from:* }";
    const adapter = new GmailAdapter({
      tokenProvider: new StaticAccessTokenProvider("token"),
      fetchImpl: async (url) => {
        expect(String(url)).toContain("q=Acme+after%3A1970%2F01%2F01+%7B+from%3A*+%7D");
        return new Response(JSON.stringify({ messages: [] }), { status: 200 });
      }
    });

    await adapter.searchConversations({ query: malicious, limit: 5 });
  });
});
