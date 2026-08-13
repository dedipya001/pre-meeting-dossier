import { ProviderError } from "../domain/schemas/common.js";
import { BaseProvider } from "../providers/provider.interface.js";

export type ProviderRunResult<T> = {
  items: T[];
  providerErrors: ProviderError[];
  partial: boolean;
};

export async function runProviders<TProvider extends BaseProvider, TItem>(
  providers: TProvider[],
  call: (provider: TProvider) => Promise<TItem[]>
): Promise<ProviderRunResult<TItem>> {
  const settled = await Promise.allSettled(providers.map(async (provider) => {
    try {
      return { provider, items: await call(provider) };
    } catch (error) {
      throw { provider: provider.metadata.id, error };
    }
  }));
  const items: TItem[] = [];
  const providerErrors: ProviderError[] = [];

  for (const result of settled) {
    if (result.status === "fulfilled") {
      items.push(...result.value.items);
    } else {
      const reason = result.reason as { provider?: string; error?: unknown };
      providerErrors.push({
        provider: reason.provider ?? "unknown",
        code: "provider_error",
        message: reason.error instanceof Error ? reason.error.message : "Provider request failed"
      });
    }
  }

  return { items, providerErrors, partial: providerErrors.length > 0 };
}
