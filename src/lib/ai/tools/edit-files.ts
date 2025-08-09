import { tool } from "ai";
import z from "zod";
import { getSandbox } from "~/lib/sandbox";



export const edit_file = ({ sandboxId }: { sandboxId: string }) =>
  tool({
    description: "Use this tool to write or edit a file at the specified path.",
    inputSchema: z.object({
      relative_file_path: z
        .string()
        .describe(
          "The relative path to the file to modify. The tool will create any directories in the path that don't exist",
        ),
      code_edit: z.string().describe("The content to write to the file"),
    }),
    execute: async ({ relative_file_path, code_edit }) => {
      try {
        const sandbox = await getSandbox(sandboxId);
        await sandbox.files.write(relative_file_path, code_edit);
        return `Successfully wrote to ${relative_file_path} `;
      } catch (error) {
        return `Error editing file: ${error}`;
      }
    },
  });
