import jwt from "jsonwebtoken";

export type AppTokenPayload = {
  sub: string;
  tenantId?: string;
  scopes: string[];
};

export class TokenService {
  constructor(private readonly jwtSecret: string) {}

  issue(payload: AppTokenPayload): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: "1h", audience: "pre-meeting-dossier", issuer: "pre-meeting-dossier" });
  }

  verify(token: string): AppTokenPayload {
    return jwt.verify(token, this.jwtSecret, { audience: "pre-meeting-dossier", issuer: "pre-meeting-dossier" }) as AppTokenPayload;
  }
}
