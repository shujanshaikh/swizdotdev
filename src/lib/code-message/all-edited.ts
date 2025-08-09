import type { ChatMessage, ToolCallFile } from "../types";

export const getAllEditedFiles = (messages: ChatMessage[]): ToolCallFile[] => {
  const editedFiles: ToolCallFile[] = [];

  for (const message of messages) {
    if (message.role !== "assistant") continue;
    for (const part of message.parts ?? []) {
      if (part.type !== "tool-edit_file") continue;

    
      const input = (part as unknown as { input?: { relative_file_path?: string; code_edit?: string } }).input;
      let relative_file_path = input?.relative_file_path;
      const code_edit = input?.code_edit ?? "";

      if (!relative_file_path) {
        const output = (part as unknown as { output?: unknown }).output;
        if (typeof output === "string") {
          const match = output.match(/Successfully wrote to\s+(.+?)\s*$/i);
          if (match) {
            relative_file_path = match[1];
          }
        }
      }

      if (!relative_file_path) continue;

      const existingIndex = editedFiles.findIndex(
        (f) => f.relative_file_path === relative_file_path,
      );

      const next: ToolCallFile = {
        relative_file_path,
        code_edit,
        instructions: "",
      };

      if (existingIndex >= 0) {
        editedFiles[existingIndex] = next;
      } else {
        editedFiles.push(next);
      }
    }
  }

  return editedFiles;
};
