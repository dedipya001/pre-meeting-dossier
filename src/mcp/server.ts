import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createProviders } from "../providers/provider-factory.js";
import { ContextSearchService } from "../services/context-search.service.js";
import { MeetingResolver } from "../services/meeting-resolver.service.js";
import { OrganizationResolver } from "../services/organization-resolver.service.js";
import { PersonResolver } from "../services/person-resolver.service.js";
import { ProviderRegistry } from "../services/provider-registry.service.js";
import { RecentChangesService } from "../services/recent-changes.service.js";
import { registerTools } from "./tools/register-tools.js";

export function createMcpServer() {
  const registry = new ProviderRegistry(createProviders());
  const personResolver = new PersonResolver();
  const organizationResolver = new OrganizationResolver();
  const meetingResolver = new MeetingResolver(registry);
  const contextSearch = new ContextSearchService(registry, personResolver, organizationResolver);
  const recentChanges = new RecentChangesService(registry);

  const server = new McpServer({
    name: "universal-pre-meeting-intelligence",
    version: "0.1.0"
  });

  registerTools(server, { meetingResolver, contextSearch, recentChanges });

  return { server, registry };
}
