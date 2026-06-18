import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FileTokenStore } from "../src/auth/token-store.js";
import type { TokenSet } from "../src/types/auth.js";

let tempDir: string;

describe("FileTokenStore", () => {
  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "spocli-"));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("persists and clears tokens", async () => {
    const store = new FileTokenStore(tempDir);
    const tokens: TokenSet = {
      accessToken: "access",
      refreshToken: "refresh",
      expiresAt: Date.now() + 1000,
      scope: "user-read-private",
      tokenType: "Bearer"
    };

    await store.set(tokens);
    expect(await store.get()).toEqual(tokens);

    await store.clear();
    expect(await store.get()).toBeNull();
  });
});
