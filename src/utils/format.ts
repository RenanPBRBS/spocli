import chalk from "chalk";

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatNumber(value: number | undefined): string {
  return typeof value === "number" ? new Intl.NumberFormat().format(value) : "Unknown";
}

export function formatArtists(artists: { name: string }[] | undefined): string {
  return artists?.map((artist) => artist.name).join(", ") || "Unknown";
}

export function truncate(value: string, maxLength = 60): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 1))}…`;
}

export function progressBar(progressMs: number, durationMs: number, width = 24): string {
  if (durationMs <= 0) {
    return `[${"░".repeat(width)}]`;
  }

  const ratio = Math.min(1, Math.max(0, progressMs / durationMs));
  const filled = Math.round(ratio * width);
  return `[${chalk.green("█".repeat(filled))}${chalk.gray("░".repeat(width - filled))}]`;
}

export function normalizeTimeRange(input?: string): "short_term" | "medium_term" | "long_term" {
  switch (input) {
    case "month":
    case "last-month":
    case "short":
    case "short_term":
      return "short_term";
    case "6-months":
    case "six-months":
    case "medium":
    case "medium_term":
    case undefined:
      return "medium_term";
    case "all-time":
    case "long":
    case "long_term":
      return "long_term";
    default:
      throw new Error(`Unsupported time range "${input}". Use month, 6-months, or all-time.`);
  }
}
