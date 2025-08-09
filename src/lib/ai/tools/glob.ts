import { tool } from "ai";
import { z } from "zod";
import { getSandbox } from "~/lib/sandbox";

interface Params {
  sandboxId: string;
}

export const glob = ({ sandboxId }: Params) => tool({
    description:
      "Search for files using glob patterns. Supports patterns like *.ts, **/*.tsx, src/**/*.{js,ts}, etc.",
    inputSchema: z.object({
      pattern: z
        .string()
        .describe(
          "Glob pattern to match files against (e.g., '*.ts', '**/*.tsx', 'src/**/*.{js,ts}')",
        ),
      exclude_pattern: z
        .string()
        .optional()
        .describe(
          "Optional glob pattern to exclude files (e.g., '**/node_modules/**')",
        ),
    }),
    execute: async ({ pattern, exclude_pattern }) => {
      try {
        const sandbox = await getSandbox(sandboxId);
        let command = `find . -name "${pattern}"`;
        if (exclude_pattern) {
          command += ` ! -path "${exclude_pattern}"`;
        }
        const result = await sandbox.commands.run(command);
        return result.stdout;
      } catch (error) {
        return `Error searching files: ${error}`;
      }
    },
  });
