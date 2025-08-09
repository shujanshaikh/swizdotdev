import { tool } from "ai";
import { z } from "zod";
import { getSandbox } from "~/lib/sandbox";

interface Params {
  sandboxId: string;
}


export const  grep =  ({ sandboxId }: Params) => tool({
    description:
      "Fast text-based regex search that finds exact pattern matches within files or directories, utilizing the ripgrep command for efficient searching.",
      inputSchema: z.object({
      query: z.string().describe("The regex pattern to search for."),
      case_sensitive: z
        .boolean()
        .describe("Whether the search should be case sensitive."),
      include_pattern: z
        .string()
        .optional()
        .describe(
          "Glob pattern for files to include (e.g. '.ts' for TypeScript files)",
        ),
      exclude_pattern: z
        .string()
        .optional()
        .describe(
          "Glob pattern for files to exclude (e.g. '.test.ts' for test files).",
        ),
    }),
    execute: async ({
      query,
      case_sensitive,
      include_pattern,
      exclude_pattern,
    }) => {
      try {
        const sandbox = await getSandbox(sandboxId);
        let command = `grep -r ${case_sensitive ? "" : "-i"} "${query}"`;
        if (include_pattern) {
          command += ` --include="${include_pattern}"`;
        }
        if (exclude_pattern) {
          command += ` --exclude="${exclude_pattern}"`;
        }
        command += " .";
        const result = await sandbox.commands.run(command);
        return result.stdout;
      } catch (error) {
        return `Error searching: ${error}`;
      }
    },
  });
