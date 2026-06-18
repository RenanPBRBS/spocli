import crypto from "node:crypto";

export function generateCodeVerifier(): string {
  return crypto.randomBytes(64).toString("base64url");
}

export function generateState(): string {
  return crypto.randomBytes(24).toString("base64url");
}

export function createCodeChallenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}
