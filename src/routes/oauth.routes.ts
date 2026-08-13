import { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import { OAuthService } from "../auth/oauth.service.js";
import { TokenService } from "../auth/token.service.js";

const pendingStates = new Set<string>();

export async function registerOAuthRoutes(app: FastifyInstance) {
  const configured = Boolean(env.GOOGLE_OAUTH_CLIENT_ID && env.GOOGLE_OAUTH_CLIENT_SECRET && env.GOOGLE_OAUTH_REDIRECT_URI);
  const tokenService = new TokenService(env.APP_JWT_SECRET);

  app.get("/oauth/status", async () => ({
    enabled: configured,
    providers: {
      google: configured ? "configured" : "missing_configuration"
    }
  }));

  app.get("/oauth/google/start", async (_request, reply) => {
    if (!configured) {
      reply.code(400);
      return { error: "Google OAuth is not configured" };
    }
    const state = randomUUID();
    pendingStates.add(state);
    const oauth = new OAuthService({
      clientId: env.GOOGLE_OAUTH_CLIENT_ID!,
      clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET!,
      redirectUri: env.GOOGLE_OAUTH_REDIRECT_URI!
    });
    reply.redirect(oauth.googleAuthorizationUrl(state));
  });

  app.get<{ Querystring: { code?: string; state?: string } }>("/oauth/google/callback", async (request, reply) => {
    if (!configured || !request.query.code || !request.query.state || !pendingStates.has(request.query.state)) {
      reply.code(400);
      return { error: "Invalid OAuth callback" };
    }
    pendingStates.delete(request.query.state);
    const oauth = new OAuthService({
      clientId: env.GOOGLE_OAUTH_CLIENT_ID!,
      clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET!,
      redirectUri: env.GOOGLE_OAUTH_REDIRECT_URI!
    });
    const googleTokens = await oauth.exchangeGoogleCode(request.query.code);
    const appToken = tokenService.issue({ sub: "local-google-user", scopes: ["calendar:read", "gmail:read", "drive:read"] });
    return {
      connected: true,
      appToken,
      googleScopes: googleTokens.scope,
      expiresIn: googleTokens.expires_in,
      note: "Persist encrypted provider tokens in ProviderConnection for production multi-user deployments."
    };
  });

  app.post("/oauth/disconnect", async () => ({
    disconnected: true,
    note: "Production disconnect should revoke provider tokens and mark ProviderConnection as revoked."
  }));
}
