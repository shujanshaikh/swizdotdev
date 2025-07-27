import type { UIMessage } from "ai";

export const getLatestEditFileData = (messages : Array<UIMessage>) => {
    let latestEditFile = { code_edit: "", relative_file_path: "" };

    if (messages && messages.at(-1)?.role === "assistant") {
      for (const part of messages.at(-1)?.parts ?? []) {
        if (
          part.type === "tool-invocation" &&
          part.toolInvocation.toolName === "edit_file"
        ) {
          const args = part.toolInvocation.args;
          const state = part.toolInvocation.state;

          if (args?.relative_file_path && args?.code_edit) {
            latestEditFile = {
              relative_file_path: args.relative_file_path,
              code_edit: args.code_edit,
            };
            return latestEditFile;
          }

          if (state === "result" && "result" in part.toolInvocation) {
            const result = part.toolInvocation.result;
            if (
              result &&
              typeof result === "object" &&
              "relative_file_path" in result &&
              "code_edit" in result
            ) {
              latestEditFile = {
                relative_file_path: result.relative_file_path,
                code_edit: result.code_edit,
              };
              return latestEditFile;
            }
          }
        }
      }
    }

    return latestEditFile;
  };