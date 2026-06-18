import chalk from "chalk";

export class SpocliError extends Error {
  public readonly exitCode: number;

  public constructor(message: string, exitCode = 1) {
    super(message);
    this.name = "SpocliError";
    this.exitCode = exitCode;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof SpocliError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}

export function printError(error: unknown): void {
  console.error(chalk.red(`Error: ${getErrorMessage(error)}`));
}
