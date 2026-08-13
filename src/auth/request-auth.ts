import { FastifyRequest } from "fastify";
import { TokenService } from "./token.service.js";

export function requireBearerAuth(request: FastifyRequest, tokenService: TokenService) {
  const authorization = request.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("Missing bearer token");
  }
  return tokenService.verify(authorization.slice("Bearer ".length));
}
