import type { ChatMessage } from "../types";

export const getLatestEditFileData = (messages: ChatMessage[]) => {
  const empty = { code_edit: "", relative_file_path: "" };

  type EditFileInputPart = {
    type: "tool-edit_file";
    state: "input-available" | "input-streaming";
    input?: { relative_file_path?: string; code_edit?: string };
  };

  const isEditFileInputPart = (p: unknown): p is EditFileInputPart => {
    if (!p || typeof p !== "object") return false;
    const x = p as Record<string, unknown>;
    return (
      x.type === "tool-edit_file" &&
      (x.state === "input-available" || x.state === "input-streaming")
    );
  };

  for (const message of [...messages].reverse()) {
    if (message.role !== "assistant") continue;

    const part = [...(message.parts ?? [])]
      .reverse()
      .find(isEditFileInputPart);

    const rel = part?.type === "tool-edit_file" ? part.input?.relative_file_path : undefined;
    const code = part?.type === "tool-edit_file" ? part.input?.code_edit : undefined;
    if (typeof rel === "string" && typeof code === "string") {
      return { relative_file_path: rel, code_edit: code };
    }
  }

  return empty;
};