# ChatGPT Plugin Connection

This app exposes a remote MCP server at `/mcp`.

Official OpenAI documentation describes remote MCP servers as public Internet endpoints implementing MCP, and ChatGPT Plugins can add a public endpoint by entering the full MCP server URL including `/mcp`. It also supports streamable HTTP and OAuth/bearer authentication for protected tools.

## Local Test

```bash
npm run dev
npx @modelcontextprotocol/inspector@latest http://localhost:3000/mcp
```

## Public HTTPS Test

Expose the server through HTTPS:

```bash
ngrok http 3000
```

Then use:

```text
https://YOUR_HOST/mcp
```

## ChatGPT Setup

1. Go to ChatGPT Plugins.
2. Add a new plugin or developer-mode app.
3. Enter a user-facing name and description.
4. Under Connection, use the public MCP URL ending in `/mcp`, or use Secure MCP Tunnel.
5. Refresh metadata after tool schema or description changes.
6. Test prompts such as:

```text
Prepare me for my next Acme meeting.
What changed since I last met this customer?
What open commitments do I have with Acme?
```

## Tool Policy

The plugin exposes only read tools. There is intentionally no `generate_dossier` tool. ChatGPT should orchestrate:

```text
get_upcoming_events
get_event_context
search_people
search_conversations
search_documents
search_business_records
search_activity
search_open_items
get_recent_changes
```

Then ChatGPT performs the final synthesis.
