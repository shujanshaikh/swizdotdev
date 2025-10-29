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
        // Validate required parameter
        if (!relative_file_path) {
          return {
            success: false,
            message: "Missing required parameter: relative_file_path",
            error: "MISSING_FILE_PATH",
          };
        }

        // Validate line numbers if not reading entire file
        if (!should_read_entire_file) {
          if (
            !Number.isInteger(start_line_one_indexed) ||
            start_line_one_indexed! < 1
          ) {
            return {
              success: false,
              message:
                "start_line_one_indexed must be a positive integer (1-indexed)",
              error: "INVALID_START_LINE",
            };
          }

          if (
            !Number.isInteger(end_line_one_indexed) ||
            end_line_one_indexed! < 1
          ) {
            return {
              success: false,
              message:
                "end_line_one_indexed must be a positive integer (1-indexed)",
              error: "INVALID_END_LINE",
            };
          }

          if (end_line_one_indexed! < start_line_one_indexed!) {
            return {
              success: false,
              message:
                "end_line_one_indexed must be greater than or equal to start_line_one_indexed",
              error: "INVALID_LINE_RANGE",
            };
          }
        }

        const sandbox = await getSandbox(sandboxId);

        // Read the file content from sandbox
        const fileContent = await sandbox.files.read(relative_file_path);

        if (!fileContent) {
          return {
            success: false,
            message: `Failed to read file: ${relative_file_path}`,
            error: "READ_ERROR",
          };
        }

        const lines = fileContent.split("\n");
        const totalLines = lines.length;

        let content: string;
        let message: string;

        if (should_read_entire_file) {
          content = fileContent;
          message = `Successfully read entire file: ${relative_file_path} (${totalLines} lines)`;
        } else {
          // Extract the requested line range (convert to 0-indexed for array slicing)
          const startIdx = start_line_one_indexed! - 1;
          const endIdx = end_line_one_indexed!; // slice is exclusive at the end
          const selectedLines = lines.slice(startIdx, endIdx);
          content = selectedLines.join("\n");
          const linesRead = selectedLines.length;
          message = `Successfully read lines ${start_line_one_indexed}-${end_line_one_indexed} from file: ${relative_file_path} (${linesRead} lines of ${totalLines} total)`;
        }

        return {
          success: true,
          message: message,
          content: content,
          totalLines: totalLines,
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to read file: ${relative_file_path}. Error: ${error}`,
          error: "READ_ERROR",
        };
      }
    },
  });
