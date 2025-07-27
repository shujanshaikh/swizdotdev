import type { UIMessage } from "ai";
import type { ToolCallFile } from "../types";

export const getAllEditedFiles = (messages : Array<UIMessage>): ToolCallFile[] => {
    const editedFiles: ToolCallFile[] = [];
    for (const message of messages) {
      if (message.role === "assistant") {
        for (const part of message.parts) {
          if (
            part.type === "tool-invocation" &&
            part.toolInvocation.toolName === "edit_file"
          ) {
            const args = part.toolInvocation.args;
            const state = part.toolInvocation.state;

            let fileData: {
              relative_file_path?: string;
              code_edit?: string;
              instructions?: string;
            } = {};

            if (args?.relative_file_path && args?.code_edit) {
              fileData = {
                relative_file_path: args.relative_file_path as string,
                code_edit: args.code_edit as string,
                instructions: (args.instructions as string) || "",
              };
            } else if (state === "result" && "result" in part.toolInvocation) {
              const result = part.toolInvocation.result as Record<
                string,
                unknown
              >;
              if (result && typeof result === "object") {
                fileData = {
                  relative_file_path: result.relative_file_path as string,
                  code_edit: result.code_edit as string,
                  instructions: (result.instructions as string) || "",
                };
              }
            }

            if (fileData.relative_file_path && fileData.code_edit) {
              const existingIndex = editedFiles.findIndex(
                (f) => f.relative_file_path === fileData.relative_file_path,
              );

              if (existingIndex >= 0) {
                editedFiles[existingIndex] = {
                  relative_file_path: fileData.relative_file_path,
                  code_edit: fileData.code_edit,
                  instructions: fileData.instructions || "",
                };
              } else {
                editedFiles.push({
                  relative_file_path: fileData.relative_file_path,
                  code_edit: fileData.code_edit,
                  instructions: fileData.instructions || "",
                });
              }
            }
          }
        }
      }
    }

    return editedFiles;
  };
