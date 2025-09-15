import { tool } from "ai";
import { z } from "zod";
import { getSandbox } from "~/lib/sandbox";

interface Params {
  sandboxId: string;
}

export const bash = ({ sandboxId }: Params) => tool({
    description:
      "Run a terminal command , Do not run npm run dev or any other dev command or nor the build command always use this tool to install the packages",
    inputSchema: z.object({
      command: z.string().describe("The terminal command to execute."),
    }),
    execute: async ({ command }) => {
      const buffer = { stdout: "", stderr: "" };
      try {
        const sandbox = await getSandbox(sandboxId);
        const result = await sandbox.commands.run(command, {
          background : true,
          onStdout: (data) => {
            buffer.stdout += data;
          },
          onStderr: (data) => {
            buffer.stderr += data;
          },
        });
        return result.stdout;
      } catch (error) {
        return `Command failed to execute: ${command}\nOutput: ${buffer.stdout}\nError: ${buffer.stderr}\nError: ${error}`;
      }
    },
  });