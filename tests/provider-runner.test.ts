import { describe, expect, it } from "vitest";
import { runProviders } from "../src/services/provider-runner.service.js";
import { BaseProvider } from "../src/providers/provider.interface.js";

describe("runProviders", () => {
  it("returns partial results with provider-specific errors", async () => {
    const providers: BaseProvider[] = [
      { metadata: { id: "ok", displayName: "OK", capabilities: ["documents"] } },
      { metadata: { id: "bad", displayName: "Bad", capabilities: ["documents"] } }
    ];
    const result = await runProviders(providers, async (provider) => {
      if (provider.metadata.id === "bad") throw new Error("boom");
      return [{ id: "doc-1" }];
    });
    expect(result.items).toEqual([{ id: "doc-1" }]);
    expect(result.partial).toBe(true);
    expect(result.providerErrors[0]).toMatchObject({ provider: "bad", message: "boom" });
  });
});
