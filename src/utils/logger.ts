import chalk from "chalk";

export const logger = {
  info(message: string): void {
    console.log(chalk.cyan(message));
  },
  success(message: string): void {
    console.log(chalk.green(message));
  },
  warn(message: string): void {
    console.warn(chalk.yellow(message));
  },
  plain(message = ""): void {
    console.log(message);
  }
};
