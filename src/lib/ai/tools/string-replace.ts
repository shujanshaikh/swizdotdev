import { tool } from "ai";
import { z } from "zod";
import { getSandbox } from "~/lib/sandbox";

interface Params {
  sandboxId: string;
}

export const string_replace = ({ sandboxId }: Params) =>
  tool({
    description:
      "Use this tool to propose a search and replace operation on an existing file.\n\nThe tool will replace ONE occurrence of old_string with new_string in the specified file.\n\nCRITICAL REQUIREMENTS FOR USING THIS TOOL:\n\n1. UNIQUENESS: The old_string MUST uniquely identify the specific instance you want to change. This means:\n   - Include AT LEAST 3-5 lines of context BEFORE the change point\n   - Include AT LEAST 3-5 lines of context AFTER the change point\n   - Include all whitespace, indentation, and surrounding code exactly as it appears in the file\n\n2. SINGLE INSTANCE: This tool can only change ONE instance at a time. If you need to change multiple instances:\n   - Make separate calls to this tool for each instance\n   - Each call must uniquely identify its specific instance using extensive context\n\n3. VERIFICATION: Before using this tool:\n   - If multiple instances exist, gather enough context to uniquely identify each one\n   - Plan separate tool calls for each instance\n",
    inputSchema: z.object({
      relative_file_path: z
        .string()
        .describe(
          "The relative path to the file to modify. The tool will create any directories in the path that don't exist",
        ),
      old_string: z
        .string()
        .describe(
          "The text to replace (must be unique within the file, and must match the file contents exactly, including all whitespace and indentation)",
        ),
      new_string: z
        .string()
        .describe(
          "The edited text to replace the old_string (must be different from the old_string)",
        ),
    }),
    execute: async ({ relative_file_path, old_string, new_string }) => {
      try {
        // Validate inputs
        if (!relative_file_path) {
          return {
            success: false,
            message: "Missing required parameter: relative_file_path",
            error: "MISSING_FILE_PATH",
          };
        }

        if (old_string === undefined || old_string === null) {
          return {
            success: false,
            message: "Missing required parameter: old_string",
            error: "MISSING_OLD_STRING",
          };
        }

        if (new_string === undefined || new_string === null) {
          return {
            success: false,
            message: "Missing required parameter: new_string",
            error: "MISSING_NEW_STRING",
          };
        }

        if (old_string === new_string) {
          return {
            success: false,
            message: "old_string and new_string must be different",
            error: "STRINGS_IDENTICAL",
          };
        }

        const sandbox = await getSandbox(sandboxId);

        // Read the file content from sandbox
        let fileContent: string;
        try {
          fileContent = await sandbox.files.read(relative_file_path);
        } catch (error) {
          if (error instanceof Error && ((error as { code?: string }).code === "ENOENT" || error.message.includes("not found"))) {
            return {
              success: false,
              message: `File not found: ${relative_file_path}`,
              error: "FILE_NOT_FOUND",
            };
          }
          return {
            success: false,
            message: `Failed to read file: ${relative_file_path}`,
            error: "READ_ERROR",
          };
        }

        // Check if old_string exists in the file
        if (!fileContent.includes(old_string)) {
          return {
            success: false,
            message: `old_string not found in file: ${relative_file_path}`,
            error: "STRING_NOT_FOUND",
          };
        }

        // Count occurrences of old_string
        const occurrences = fileContent.split(old_string).length - 1;
        if (occurrences > 1) {
          return {
            success: false,
            message: `old_string appears ${occurrences} times in the file. It must be unique. Please include more context to make it unique.`,
            error: "STRING_NOT_UNIQUE",
          };
        }

        // Perform the replacement
        const newContent = fileContent.replace(old_string, new_string);

        // Write the modified content back to the file
        try {
          await sandbox.files.write(relative_file_path, newContent);
          return {
            success: true,
            message: `Successfully replaced string in file: ${relative_file_path}`,
          };
        } catch (error) {
          return {
            success: false,
            message: `Failed to write to file: ${relative_file_path}`,
            error: "WRITE_ERROR",
          };
        }
      } catch (error) {
        return {
          success: false,
          message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
          error: "UNEXPECTED_ERROR",
        };
      }
    },
  });
