import { tool } from "ai";
import z from "zod";
import { getSandbox } from "~/lib/sandbox";


interface Params {
    sandboxId : string
}

export const  string_replace = ({ sandboxId }: Params) =>
     tool({
    description:
      "Performs exact string replacements in files.\nUse this tool to make small, specific edits to a file. For example, to edit some text, a couple of lines of code, etc. Use edit_file for larger edits.\n\nEnsure you preserve the exact indentation (tabs/spaces) as it appears AFTER the line number prefix added by the read_file tool.\nOnly use this tool if you are sure that the old_string is unique in the file, otherwise use the edit_file tool.\n\nThe edit will FAIL if `old_string` is not unique in the file. Either provide a larger string with more surrounding context to make it unique or use `replace_all` to change every instance of `old_string`.\n\nUse `replace_all` for replacing and renaming strings across the file. This parameter is useful if you want to rename a variable for instance.\n\nOnly use emojis if the user explicitly requests it. Avoid adding emojis to files unless asked.",
    inputSchema: z.object({
      relative_file_path: z
        .string()
        .describe(
          "The relative path to the file to modify. The tool will create any directories in the path that don't exist",
        ),
      old_string: z
        .string()
        .describe(
          "The string to replace. This string must be unique in the file. If it's not, use `replace_all` to change every instance of `old_string`.",
        ),
      new_string: z
        .string()
        .describe(
          "The string to replace `old_string` with. This string must be unique in the file. If it's not, use `replace_all` to change every instance of `old_string`.",
        ),
      replace_all: z
        .boolean()
        .describe(
          "Whether to replace all instances of `old_string` in the file. If true, the tool will replace all instances of `old_string` in the file. If false, the tool will replace only the first instance of `old_string` in the file.",
        ),
    }),
    execute: async ({
      relative_file_path,
      old_string,
      new_string,
      replace_all,
    }) => {
      try {
        const sandbox = await getSandbox(sandboxId);
        const content = await sandbox.files.read(relative_file_path);
        const updatedContent = replace_all
          ? content.replaceAll(old_string, new_string)
          : content.replace(old_string, new_string);
        await sandbox.files.write(relative_file_path, updatedContent);
        return `String replacement completed in ${relative_file_path}`;
      } catch (error) {
        return `Error replacing string: ${error}`;
      }
    },
  })
