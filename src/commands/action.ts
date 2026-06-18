import type { Command } from "commander";
import { printError } from "../utils/errors.js";

export function runAction<TArgs extends unknown[]>(
  action: (...args: TArgs) => Promise<void>
): (...args: TArgs) => Promise<void> {
  return async (...args: TArgs) => {
    try {
      await action(...args);
    } catch (error) {
      printError(error);
      process.exitCode = 1;
    }
  };
}

export function addAliases(command: Command, aliases: string[]): Command {
  for (const alias of aliases) {
    command.alias(alias);
  }

  return command;
}
