import { tool } from "ai";
import { z } from "zod";
import { getSandbox } from "~/lib/sandbox";

interface Params {
  sandboxId: string;
}

export const task_agent = ({ sandboxId }: Params) => tool({
    description:
      "Launches a highly capable task agent in the workspace. Usage notes:\n1. When the agent is done, it will return a report of its actions. This report is also visible to USER, so you don't have to repeat any overlapping information.\n2. Each agent invocation is stateless and doesn't have access to your chat history with USER. You will not be able to send additional messages to the agent, nor will the agent be able to communicate with you outside of its final report. Therefore, your prompt should contain a highly detailed task description for the agent to perform autonomously and you should specify exactly what information the agent should return back to you in its final and only message to you.\n3. The agent's outputs should generally be trusted.",
    inputSchema: z.object({
      prompt: z.string().describe("The task for the agent to perform."),
      integrations: z
        .array(z.string())
        .describe(
          "Choose the external services the agent should interact with.",
        ),
      relative_file_paths: z
        .array(z.string())
        .describe("Relative paths to files that are relevant to the task."),
    }),
    execute: async ({ prompt, integrations, relative_file_paths }) => {
      try {
        const sandbox = await getSandbox(sandboxId);

        // Build the command with the new parameters
        let command = `task_agent "${prompt}"`;

        // Add integrations if provided
        if (integrations && integrations.length > 0) {
          command += ` --integrations "${integrations.join(",")}"`;
        }

        // Add file paths if provided
        if (relative_file_paths && relative_file_paths.length > 0) {
          command += ` --files "${relative_file_paths.join(",")}"`;
        }

        const result = await sandbox.commands.run(command);
        return result.stdout;
      } catch (error) {
        return `Task agent execution failed: ${error}`;
      }
    },
  });
