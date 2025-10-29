import { tool } from "ai";
import { z } from "zod";
import { getSandbox } from "~/lib/sandbox";

interface Params {
  sandboxId: string;
}

export const glob = ({ sandboxId }: Params) =>
  tool({
    description:
      "Use this tool to find files matching a glob pattern in a given path",
    inputSchema: z.object({
      pattern: z
        .string()
        .describe('Glob pattern (e.g., "**/*.js")'),
      path: z
        .string()
        .optional()
        .describe("Relative directory path to search in"),
    }),
    execute: async ({ pattern, path }) => {
      try {
        // Validate inputs
        if (!pattern) {
          return {
            success: false,
            message: "Missing required parameter: pattern",
            error: "MISSING_PATTERN",
          };
        }

        const sandbox = await getSandbox(sandboxId);

        // Build the command to find files matching the glob pattern
        // Use bash with globstar enabled for ** patterns
        const searchPath = path || ".";
        
        // Use bash globstar for patterns with **, otherwise use find
        let command: string;
        if (pattern.includes("**")) {
          // Use bash with globstar for recursive patterns
          // Escape single quotes in the pattern for bash -c
          const escapedPattern = pattern.replace(/'/g, "'\\''");
          command = `bash -c 'cd "${searchPath}" && shopt -s globstar nullglob; for file in ${escapedPattern}; do [ -f "$file" ] && echo "$file"; done'`;
        } else {
          // Use find for simpler patterns
          const escapedPattern = pattern.replace(/"/g, '\\"');
          command = `find ${searchPath} -name "${escapedPattern}" -type f 2>/dev/null`;
        }

        const result = await sandbox.commands.run(command);

        // Parse the output - filter out empty lines and get file list
        const files = result.stdout
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0);

        // Format the success message
        const searchLocation = path ? ` in "${path}"` : " in current directory";
        const message = `Found ${files.length} matches for pattern "${pattern}"${searchLocation}`;

        return {
          success: true,
          message: message,
          files: files,
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to find files matching pattern: ${pattern}`,
          error: "GLOB_ERROR",
        };
      }
    },
  });
