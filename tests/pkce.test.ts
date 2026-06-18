import { describe, expect, it } from "vitest";
import { createCodeChallenge, generateCodeVerifier, generateState } from "../src/auth/pkce.js";

describe("pkce", () => {
  it("generates high entropy verifier and state values", () => {
    expect(generateCodeVerifier()).toHaveLength(86);
    expect(generateState().length).toBeGreaterThan(20);
  });

  it("creates the RFC 7636 S256 challenge", () => {
    const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
    expect(createCodeChallenge(verifier)).toBe("E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
  });
});
