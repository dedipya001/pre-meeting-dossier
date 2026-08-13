import { FastifyInstance } from "fastify";
import { ProviderRegistry } from "../services/provider-registry.service.js";

export async function registerHealthRoutes(app: FastifyInstance, registry: ProviderRegistry) {
  app.get("/health", async () => ({ ok: true }));
  app.get("/providers", async () => ({ providers: registry.listConnected() }));
}
