import { randomUUID } from "node:crypto";
import fastify from "fastify";
import rateLimit from "@fastify/rate-limit";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { env } from "./config/env.js";
import { createMcpServer } from "./mcp/server.js";
import { registerHealthRoutes } from "./routes/health.routes.js";
import { registerOAuthRoutes } from "./routes/oauth.routes.js";
import { TokenService } from "./auth/token.service.js";
import { requireBearerAuth } from "./auth/request-auth.js";

const transports: Record<string, StreamableHTTPServerTransport> = {};
const { registry } = createMcpServer();

const app = fastify({
  logger: {
    level: env.LOG_LEVEL,
    redact: ["req.headers.authorization", "req.headers.cookie"]
  }
});

await app.register(rateLimit, {
  max: env.RATE_LIMIT_MAX,
  timeWindow: env.RATE_LIMIT_WINDOW
});

await registerHealthRoutes(app, registry);
await registerOAuthRoutes(app);

app.all("/mcp", async (request, reply) => {
  if (env.MCP_REQUIRE_AUTH) {
    try {
      requireBearerAuth(request, new TokenService(env.APP_JWT_SECRET));
    } catch {
      reply.code(401).send({ error: "Unauthorized" });
      return;
    }
  }

  const sessionId = request.headers["mcp-session-id"];
  let transport: StreamableHTTPServerTransport | undefined;

  if (typeof sessionId === "string" && transports[sessionId]) {
    transport = transports[sessionId];
  } else if (request.method === "POST" && isInitializeRequest(request.body)) {
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (newSessionId) => {
        if (transport) transports[newSessionId] = transport;
      }
    });
    transport.onclose = () => {
      const closedSessionId = transport?.sessionId;
      if (closedSessionId) delete transports[closedSessionId];
    };
    const { server } = createMcpServer();
    await server.connect(transport);
  } else {
    reply.code(400).send({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Bad Request: missing MCP session or initialize request" },
      id: null
    });
    return;
  }

  await transport.handleRequest(request.raw, reply.raw, request.body);
  reply.hijack();
});

await app.listen({ port: env.PORT, host: env.HOST });
