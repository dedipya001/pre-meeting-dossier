import { Capability } from "../domain/types/capabilities.js";
import { BaseProvider } from "../providers/provider.interface.js";

export class ProviderRegistry {
  constructor(private readonly providers: BaseProvider[]) {}

  findByCapability<T extends BaseProvider>(capability: Capability): T[] {
    return this.providers.filter((provider) => provider.metadata.capabilities.includes(capability)) as T[];
  }

  listConnected() {
    return this.providers.map((provider) => ({
      id: provider.metadata.id,
      displayName: provider.metadata.displayName,
      capabilities: provider.metadata.capabilities,
      status: "connected" as const
    }));
  }
}
