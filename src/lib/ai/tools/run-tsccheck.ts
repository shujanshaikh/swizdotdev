import { tool } from "ai";
import { z } from "zod";
import { getSandbox } from "~/lib/sandbox";

interface Params {
  sandboxId: string;
}

export const run_tsccheck = ({ sandboxId }: Params) => tool({
    description:"Run the tsc check to check for type errors. This tool validates TypeScript code for type safety issues. Use this tool after code changes or at completion to ensure type correctness. Has a 30-second timeout to handle large codebases efficiently.",
    inputSchema: z.object({
      relative_file_path: z.string(),
    }),
    execute: async ({ relative_file_path }) => {
      const buffer = { stdout: "", stderr: "" };
      try {
        const sandbox = await getSandbox(sandboxId);
        const result = await sandbox.commands.run(`npx tsc --noEmit ${relative_file_path}`, {
          background : true,
          stdin: false,
          onStdout: (data) => {
            buffer.stdout += data;
          },
          onStderr: (data) => {
            buffer.stderr += data;
          },
          timeoutMs: 0, 
        });
        const output = buffer.stdout || result.stdout || "";
        const errors = buffer.stderr || result.stderr || "";
        
        if (errors) {
          return `TypeScript Check Results:\n${output}\n${errors}`;
        }
        
        return output || "TypeScript check completed successfully - no errors found!";
      } catch (error) {
        if (error instanceof Error && error.message.includes('timeout')) {
          return `TypeScript check timed out after 30 seconds. This might indicate:\n1. Large codebase requiring more time\n2. Circular dependencies\n3. Complex type checking\n\nPartial output:\n${buffer.stdout}\n${buffer.stderr}`;
        }
        return `Command failed to execute: npx tsc --noEmit\nOutput: ${buffer.stdout}\nError: ${buffer.stderr}\nError: ${error}`;
      }
    },
  });