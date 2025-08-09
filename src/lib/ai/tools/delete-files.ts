import { tool } from "ai";
import {z} from "zod"
import { getSandbox } from "~/lib/sandbox";

interface Params {
    sandboxId: string;
  }

export const delete_file = ({ sandboxId } : Params) => tool({
    description:
      "Deletes a file at the specified path. The operation will fail gracefully if the file doesn't exist.",
    inputSchema: z.object({
      relative_file_path: z
        .string()
        .describe("The relative path to the file to delete."),
    }),
    execute: async ({ relative_file_path }) => {
      try {
        const sandbox = await getSandbox(sandboxId);
        await sandbox.files.remove(relative_file_path);
        return `File ${relative_file_path} deleted successfully`;
      } catch (error) {
        return `Error deleting file: ${error}`;
      }
    },
  })
