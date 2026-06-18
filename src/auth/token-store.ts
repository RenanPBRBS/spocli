import fs from "node:fs/promises";
import path from "node:path";
import { getConfigDir } from "../utils/config.js";
import type { TokenSet } from "../types/auth.js";

export interface TokenStore {
  get(): Promise<TokenSet | null>;
  set(tokens: TokenSet): Promise<void>;
  clear(): Promise<void>;
}

export class FileTokenStore implements TokenStore {
  private readonly filePath: string;

  public constructor(configDir = getConfigDir()) {
    this.filePath = path.join(configDir, "tokens.json");
  }

  public async get(): Promise<TokenSet | null> {
    try {
      const raw = await fs.readFile(this.filePath, "utf8");
      const parsed: unknown = JSON.parse(raw);
      return parsed as TokenSet;
    } catch (error) {
      if (isMissingFile(error)) {
        return null;
      }

      throw error;
    }
  }

  public async set(tokens: TokenSet): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true, mode: 0o700 });
    await fs.writeFile(this.filePath, `${JSON.stringify(tokens, null, 2)}\n`, { mode: 0o600 });
  }

  public async clear(): Promise<void> {
    try {
      await fs.rm(this.filePath);
    } catch (error) {
      if (!isMissingFile(error)) {
        throw error;
      }
    }
  }
}

function isMissingFile(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}
