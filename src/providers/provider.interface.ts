import { Capability } from "../domain/types/capabilities.js";

export type ProviderMetadata = {
  id: string;
  displayName: string;
  capabilities: readonly Capability[];
};

export interface BaseProvider {
  metadata: ProviderMetadata;
}
