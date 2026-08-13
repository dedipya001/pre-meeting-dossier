import { describe, expect, it } from "vitest";
import { ChangeDetectionService } from "../src/services/change-detection.service.js";
import { OrganizationResolver } from "../src/services/organization-resolver.service.js";
import { PersonResolver } from "../src/services/person-resolver.service.js";

describe("PersonResolver", () => {
  it("prefers email for stable identity keys", () => {
    const resolver = new PersonResolver();
    expect(resolver.normalizeKey({ name: "John Smith", email: "John.Smith@Acme.com", organization: "Acme" })).toBe("john.smith@acme.com");
  });

  it("does not merge same-name people across organizations", () => {
    const resolver = new PersonResolver();
    const people = resolver.dedupe([
      { id: "1", name: "John Smith", organization: "Acme", sourceReferences: [] },
      { id: "2", name: "John Smith", organization: "Beta", sourceReferences: [] }
    ]);
    expect(people).toHaveLength(2);
  });
});

describe("OrganizationResolver", () => {
  it("infers non-generic organizations from email domains", () => {
    const resolver = new OrganizationResolver();
    expect(resolver.inferFromEmail("sarah.rao@acme.com")).toBe("Acme");
    expect(resolver.inferFromEmail("person@gmail.com")).toBeUndefined();
  });
});

describe("ChangeDetectionService", () => {
  it("creates deterministic diffs for important fields", () => {
    const service = new ChangeDetectionService();
    const changes = service.diffRecords(
      { stage: "evaluation", value: 100000 },
      { stage: "negotiation", value: 120000 },
      { provider: "mock", sourceType: "crm", externalId: "opp-1" }
    );
    expect(changes.map((change) => change.type)).toEqual(["stage_changed", "value_changed"]);
    expect(changes[0].importance).toBe("high");
  });
});
