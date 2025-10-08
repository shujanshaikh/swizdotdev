import { tool } from "ai";
import { z } from "zod";
import { getSandbox } from "~/lib/sandbox";

interface Params {
  sandboxId: string;
}


export const GREP_LIMITS = {
  /**
   * Default maximum number of matches to return if not specified
   * 500 matches provides good coverage without overwhelming the API
   */
  DEFAULT_MAX_MATCHES: 200,

  /**
   * Maximum total output size for grep results
   * 1MB - prevents "Request Entity Too Large" errors
   */
  MAX_TOTAL_OUTPUT_SIZE: 1 * 1024 * 1024, // 1MB

  /**
   * Message to append when grep results are truncated
   */
  TRUNCATION_MESSAGE:
    '\n[Results truncated due to size limits. Use more specific patterns or file filters to narrow your search.]',
};



export const  grep =  ({ sandboxId }: Params) => tool({
    description:
      "Fast text-based regex search that finds exact pattern matches within files or directories, utilizing the ripgrep command for efficient searching.",
      inputSchema: z.object({
        query: z.string().describe('The regex pattern to search for'),
        case_sensitive: z
          .boolean()
          .optional()
          .describe('Whether the search should be case sensitive'),
        include_file_pattern: z
          .string()
          .optional()
          .describe('Glob pattern for files to include (e.g., "*.ts")'),
        exclude_file_pattern: z
          .string()
          .optional()
          .describe('Glob pattern for files to exclude'),
        max_matches: z
          .number()
          .optional()
          .default(GREP_LIMITS.DEFAULT_MAX_MATCHES)
          .describe(
            `Maximum number of matches to return (default: ${GREP_LIMITS.DEFAULT_MAX_MATCHES}). Results may be truncated if this limit is exceeded.`,
          ),
        explanation: z
          .string()
          .describe('One sentence explanation of why this tool is being used'),
    }),
    execute: async ({
      query,
      case_sensitive,
      include_file_pattern,
      exclude_file_pattern,
      max_matches,
      explanation,
    }) => {

      if (!query) {
        return {
          success: false,
          message: 'Missing required parameter: query',
          error: 'MISSING_QUERY',
        };
      }
    
      if (!explanation) {
        return {
          success: false,
          message: 'Missing required parameter: explanation',
          error: 'MISSING_EXPLANATION',
        };
      }


      try {
        const sandbox = await getSandbox(sandboxId );
        const excludePatterns = exclude_file_pattern
        ? [exclude_file_pattern]
        : undefined;
  

        // Compose the grep command with appropriate flags and patterns
        let command = `grep -r ${case_sensitive ? "" : "-i"} "${query}"`;

        if (include_file_pattern) {
          command += ` --include="${include_file_pattern}"`;
        }
        if (exclude_file_pattern) {
          command += ` --exclude="${exclude_file_pattern}"`;
        }
        command += " .";


        // Run the command in the sandbox
        const grepResult = await sandbox.commands.run(command, {
          background: false,
          timeoutMs: 30_000,
          stdin: true,
        });

        if(!grepResult.stdout) {
          return `Error searching: ${grepResult.stderr}`;
        }
        return grepResult.stdout;
      } catch (error) {
        return `Error searching: ${error}`;
      }
    },
  });
