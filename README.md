# Universal Pre-Meeting Intelligence MCP Server

Provider-agnostic pre-meeting dossier retrieval layer. The server exposes generic MCP tools to ChatGPT and keeps provider details behind adapters. ChatGPT performs final dossier synthesis.

## File Structure

```text
src/
  server.ts
  config/env.ts
  mcp/server.ts
  mcp/tools/register-tools.ts
  domain/schemas/
  domain/types/
  services/
  providers/
    calendar/
    communications/
    documents/
    business-records/
    tasks/
    mock/
  auth/
  database/
  routes/
  utils/
tests/
prisma/schema.prisma
```

## Architecture Decisions

- MCP tools are generic: no Gmail, Salesforce, HubSpot, or Drive-specific tool names.
- Providers advertise capabilities and are selected through `ProviderRegistry`.
- Independent provider searches run through a parallel provider runner and return partial errors.
- Every meaningful mock result includes a `sourceReference`.
- OAuth and real Google adapters are intentionally deferred until later phases.
- Mock data demonstrates `Prepare me for my next Acme meeting` without external credentials.
- Google Calendar is available as the first real calendar adapter and is optional in local development.

## MCP Tools Implemented

- `get_upcoming_events`
- `get_event_context`
- `search_people`
- `search_organizations`
- `search_conversations`
- `search_documents`
- `search_business_records`
- `search_activity`
- `search_open_items`
- `get_recent_changes`

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env
```

3. Start PostgreSQL and Redis:

```bash
docker compose up -d
```

4. Generate Prisma client and run migrations when database persistence is needed:

```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Run the MCP server:

```bash
npm run dev
```

The HTTP MCP endpoint is available at:

```text
http://localhost:3000/mcp
```

Health checks:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/providers
```

## Example MCP Calls

Suggested ChatGPT orchestration for `Prepare me for my next Acme meeting`:

```text
get_upcoming_events({ "query": "Acme", "limit": 5 })
get_event_context({ "eventId": "event-acme-cpq-architecture-review" })
search_people({ "organization": "Acme Corporation" })
search_conversations({ "organization": "Acme Corporation", "limit": 10 })
search_documents({ "query": "CPQ architecture proposal", "organization": "Acme Corporation" })
search_business_records({ "organization": "Acme Corporation" })
search_open_items({ "organization": "Acme Corporation" })
get_recent_changes({ "organization": "Acme Corporation", "since": "2026-08-06T00:00:00.000Z" })
```

## Testing

```bash
npm run typecheck
npm run lint
npm test
```

## HTTPS and ChatGPT Connection

For local remote-MCP testing, expose `http://localhost:3000/mcp` through an HTTPS tunnel such as ngrok or Cloudflare Tunnel, then configure ChatGPT to use the HTTPS `/mcp` URL. Use the tool descriptions in `src/mcp/tools/register-tools.ts` as the plugin-facing contract.

## Real Provider Adapters

The app includes real read-only Google adapters behind generic provider interfaces:

- `get_upcoming_events`
- `get_event_context`
- `search_conversations`
- `search_people`
- `search_documents`

Use manually supplied access tokens for simple local testing:

Set these values in `.env`:

```bash
GOOGLE_CALENDAR_ENABLED=true
GOOGLE_CALENDAR_ACCESS_TOKEN=ya29...
GOOGLE_CALENDAR_ID=primary
GMAIL_ENABLED=true
GMAIL_ACCESS_TOKEN=ya29...
GOOGLE_DRIVE_ENABLED=true
GOOGLE_DRIVE_ACCESS_TOKEN=ya29...
```

Recommended Google scopes:

```text
https://www.googleapis.com/auth/calendar.readonly
https://www.googleapis.com/auth/gmail.readonly
https://www.googleapis.com/auth/drive.metadata.readonly
```

You can keep `MOCK_PROVIDER_ENABLED=true` to search mock and real providers together, or set it to `false` when testing only real providers.

## Google OAuth

The app includes Google OAuth start/callback routes:

```text
GET /oauth/google/start
GET /oauth/google/callback
POST /oauth/disconnect
```

Configure:

```bash
GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/oauth/google/callback
APP_JWT_SECRET=replace-with-a-long-random-secret
MCP_REQUIRE_AUTH=true
```

Production deployments should persist encrypted provider tokens in `ProviderConnection`; the local callback currently returns an app bearer token and notes where persistence belongs.

## Plugin Packaging

See:

- `plugin.json`
- `docs/CHATGPT_PLUGIN.md`
- `docs/SECURITY.md`

Connect ChatGPT to the public HTTPS MCP endpoint ending in `/mcp`.

## Next Hardening

- Persist OAuth tokens and audit events with Prisma repositories.
- Add tenant-aware provider registry lookups per authenticated user.
- Add provider request timeouts and retry policies per adapter.
- Add CI and deployment manifests for the target host.
