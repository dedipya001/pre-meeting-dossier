import { describe, expect, it } from "vitest";
import { TokenService } from "../src/auth/token.service.js";
import { EncryptionService } from "../src/auth/encryption.service.js";

describe("auth services", () => {
  it("issues and verifies app tokens", () => {
    const service = new TokenService("secret");
    const token = service.issue({ sub: "user-1", scopes: ["calendar:read"] });
    expect(service.verify(token)).toMatchObject({ sub: "user-1", scopes: ["calendar:read"] });
  });

  it("encrypts and decrypts secrets", () => {
    const key = Buffer.alloc(32, 1);
    const service = new EncryptionService(key);
    const ciphertext = service.encrypt("refresh-token");
    expect(ciphertext).not.toBe("refresh-token");
    expect(service.decrypt(ciphertext)).toBe("refresh-token");
  });
});
