import { GetRecentChangesInput } from "../domain/schemas/search.js";
import { ChangeProvider } from "../providers/tasks/task-provider.interface.js";
import { BaseProvider } from "../providers/provider.interface.js";
import { byRecency } from "../utils/search.js";
import { ProviderRegistry } from "./provider-registry.service.js";
import { runProviders } from "./provider-runner.service.js";

type ChangeCapable = BaseProvider & ChangeProvider;

export class RecentChangesService {
  constructor(private readonly registry: ProviderRegistry) {}

  async getRecentChanges(input: GetRecentChangesInput) {
    const providers = this.registry.findByCapability<ChangeCapable>("changes");
    const result = await runProviders(providers, (provider) => provider.getRecentChanges(input));
    return { changes: byRecency(result.items), partial: result.partial, providerErrors: result.providerErrors };
  }
}
