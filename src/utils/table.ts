import Table from "cli-table3";

export function createTable(head: string[]): InstanceType<typeof Table> {
  return new Table({
    head,
    wordWrap: true,
    colWidths: head.length >= 4 ? [6, 34, 28, 20, 12].slice(0, head.length) : undefined,
    style: {
      head: ["cyan"]
    }
  });
}
