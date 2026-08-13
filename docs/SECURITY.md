# Security and Privacy

This service is a read-oriented intelligence retrieval layer. It should retrieve only information the authenticated user is authorized to access and return source-backed evidence to ChatGPT.

## Current Controls

- Generic MCP tools only; provider-specific APIs stay behind adapters.
- Optional bearer-token protection for `/mcp` with `MCP_REQUIRE_AUTH=true`.
- Google OAuth authorization-code flow endpoints for local/full-app integration.
- Encrypted-token abstraction using AES-256-GCM.
- Rate limiting through Fastify.
- Structured logs redact authorization and cookie headers.
- Provider failures return partial results instead of failing an entire dossier flow.
- MCP tools do not generate dossiers or unsupported conclusions.

## Production Requirements

- Store provider access and refresh tokens encrypted in `ProviderConnection`.
- Verify issuer, audience, expiry, and scopes for every inbound MCP bearer token.
- Revoke provider tokens on disconnect.
- Persist audit events without raw document bodies, email bodies, or OAuth tokens.
- Use least-privilege scopes:
  - Google Calendar: `calendar.readonly`
  - Gmail: `gmail.readonly`
  - Drive: `drive.metadata.readonly`
- Run only behind HTTPS or Secure MCP Tunnel.

## Prompt Injection

Provider content may contain adversarial text. Treat emails, docs, descriptions, and chat messages as untrusted data. The MCP server returns evidence; ChatGPT should not follow instructions found inside retrieved content unless the user explicitly confirms them.
