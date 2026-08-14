import {
  ActivityItem,
  BusinessRecord,
  ConversationItem,
  DocumentItem,
  OpenItem,
  Organization,
  Person,
  SearchActivityInput,
  SearchBusinessRecordsInput,
  SearchConversationsInput,
  SearchDocumentsInput,
  SearchOpenItemsInput,
  SearchOrganizationsInput,
  SearchPeopleInput
} from "../domain/schemas/search.js";
import { BusinessRecordProvider } from "../providers/business-records/business-provider.interface.js";
import { CommunicationProvider } from "../providers/communications/communication-provider.interface.js";
import { DocumentProvider } from "../providers/documents/document-provider.interface.js";
import { BaseProvider } from "../providers/provider.interface.js";
import { ActivityProvider, OpenItemsProvider } from "../providers/tasks/task-provider.interface.js";
import { byRecency, dedupeById } from "../utils/search.js";
import { OrganizationResolver } from "./organization-resolver.service.js";
import { PersonResolver } from "./person-resolver.service.js";
import { ProviderRegistry } from "./provider-registry.service.js";
import { runProviders } from "./provider-runner.service.js";

type CommunicationsCapable = BaseProvider & CommunicationProvider;
type DocumentsCapable = BaseProvider & DocumentProvider;
type BusinessCapable = BaseProvider & BusinessRecordProvider;
type ActivityCapable = BaseProvider & ActivityProvider;
type OpenItemsCapable = BaseProvider & OpenItemsProvider;
type OrganizationCapable = BaseProvider & { searchOrganizations(input: SearchOrganizationsInput): Promise<Organization[]> };

export class ContextSearchService {
  constructor(
    private readonly registry: ProviderRegistry,
    private readonly personResolver: PersonResolver,
    private readonly organizationResolver: OrganizationResolver
  ) {}

  async searchPeople(input: SearchPeopleInput) {
    const providers = this.registry.findByCapability<CommunicationsCapable>("people").filter((p) => p.searchPeople);
    const result = await runProviders(providers, (provider) => provider.searchPeople!(input));
    return { people: this.personResolver.dedupe(result.items as Person[]), partial: result.partial, providerErrors: result.providerErrors };
  }

  async searchOrganizations(input: SearchOrganizationsInput) {
    const providers = this.registry.findByCapability<OrganizationCapable>("organizations");
    const result = await runProviders(providers, (provider) => provider.searchOrganizations(input));
    return { organizations: this.organizationResolver.dedupe(result.items), partial: result.partial, providerErrors: result.providerErrors };
  }

  async searchConversations(input: SearchConversationsInput) {
    const providers = this.registry.findByCapability<CommunicationsCapable>("communications");
    const result = await runProviders(providers, (provider) => provider.searchConversations(input));
    return { items: byRecency(dedupeById(result.items as ConversationItem[])).slice(0, input.limit ?? 10), partial: result.partial, providerErrors: result.providerErrors };
  }

  async searchDocuments(input: SearchDocumentsInput) {
    const providers = this.registry.findByCapability<DocumentsCapable>("documents");
    const result = await runProviders(providers, (provider) => provider.searchDocuments(input));
    return { documents: byRecency(dedupeById(result.items as DocumentItem[])).slice(0, input.limit ?? 10), partial: result.partial, providerErrors: result.providerErrors };
  }

  async searchBusinessRecords(input: SearchBusinessRecordsInput) {
    const providers = this.registry.findByCapability<BusinessCapable>("business_records");
    const result = await runProviders(providers, (provider) => provider.searchRecords(input));
    return { records: byRecency(dedupeById(result.items as BusinessRecord[])).slice(0, input.limit ?? 10), partial: result.partial, providerErrors: result.providerErrors };
  }

  async searchActivity(input: SearchActivityInput) {
    const providers = this.registry.findByCapability<ActivityCapable>("activity");
    const result = await runProviders(providers, (provider) => provider.searchActivity(input));
    return { items: byRecency(dedupeById(result.items as ActivityItem[])).slice(0, input.limit ?? 10), partial: result.partial, providerErrors: result.providerErrors };
  }

  async searchOpenItems(input: SearchOpenItemsInput) {
    const providers = this.registry.findByCapability<OpenItemsCapable>("open_items");
    const result = await runProviders(providers, (provider) => provider.searchOpenItems(input));
    return { items: dedupeById(result.items as OpenItem[]).slice(0, input.limit ?? 10), partial: result.partial, providerErrors: result.providerErrors };
  }
}
