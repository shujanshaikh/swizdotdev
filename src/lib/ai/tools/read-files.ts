import { tool } from "ai";
import z from "zod";
import { getSandbox } from "~/lib/sandbox";

interface Params {
  sandboxId: string;
}

export const read_file = ({ sandboxId }: Params) =>
  tool({
    description:
      "Read the contents of a file. For text files, the output will be the 1-indexed file contents from start_line_one_indexed to end_line_one_indexed_inclusive.",
    inputSchema: z.object({
      relative_file_path: z
        .string()
        .describe("The relative path to the file to read."),
      should_read_entire_file: z
        .boolean()
        .describe("Whether to read the entire file."),
      start_line_one_indexed: z
        .number()
        .optional()
        .describe(
          "The one-indexed line number to start reading from (inclusive).",
        ),
      end_line_one_indexed: z
        .number()
        .optional()
        .describe("The one-indexed line number to end reading at (inclusive)."),
    }),
    execute: async ({
      relative_file_path,
      should_read_entire_file,
      start_line_one_indexed,
      end_line_one_indexed,
    }) => {
      try {
        const sandbox = await getSandbox(sandboxId);
        if (should_read_entire_file) {
          const content = await sandbox.files.read(relative_file_path);
          return content;
        } else {
          const command = `sed -n '${start_line_one_indexed},${end_line_one_indexed}p' ${relative_file_path}`;
          const result = await sandbox.commands.run(command);
          return result.stdout;
        }
      } catch (error) {
        return `Error reading file: ${error} ${relative_file_path} ${start_line_one_indexed} ${end_line_one_indexed}`;
      }
    },
  });
