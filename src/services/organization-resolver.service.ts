import { Organization } from "../domain/schemas/search.js";

const genericDomains = new Set(["gmail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com", "example.com"]);

export class OrganizationResolver {
  inferFromEmail(email: string): string | undefined {
    const domain = email.split("@")[1]?.toLowerCase();
    if (!domain || genericDomains.has(domain)) return undefined;
    const label = domain.split(".")[0];
    return label ? `${label[0].toUpperCase()}${label.slice(1)}` : undefined;
  }

  dedupe(organizations: Organization[]): Organization[] {
    return [...new Map(organizations.map((org) => [(org.domain ?? org.name).toLowerCase(), org])).values()];
  }
}
