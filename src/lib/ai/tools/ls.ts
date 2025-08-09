import { tool } from "ai";
import { z } from "zod";
import { getSandbox } from "~/lib/sandbox";

interface Params {
  sandboxId: string;
}

export const ls = ({ sandboxId }: Params) => tool({
    description:
      "List the contents of a directory. The quick tool to use for discovery, before using more targeted tools like semantic search or file reading.",
    inputSchema: z.object({
      relative_dir_path: z
        .string()
        .describe(
          "The relative path to the directory to list contents of.",
        ),
    }),
    execute: async ({ relative_dir_path }) => {
      try {
        const sandbox = await getSandbox(sandboxId);
        const result = await sandbox.commands.run(
          `ls -la ${relative_dir_path}`,
        );
        return result.stdout;
      } catch (error) {
        return `Error listing directory: ${error}`;
      }
    },
  });