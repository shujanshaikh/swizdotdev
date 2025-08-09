import type { InferUITool, UIMessage } from "ai"
import type { webscraper } from "./ai/tools/web-scrape"
import type { web_search } from "./ai/tools/web-search"
import type { suggestions } from "./ai/tools/suggestion"
import z from "zod"
import { edit_file } from "./ai/tools/edit-files"
import { grep } from "./ai/tools/grep"
import { ls } from "./ai/tools/ls"
import { glob } from "./ai/tools/glob"
import { task_agent } from "./ai/tools/task-agent"
import { bash } from "./ai/tools/bash"

export interface FileType {
    name: string
    type: "file" | "directory"
    isOpen?: boolean
    children?: FileType[]
    path: string
}

export interface FileEdit {
    relative_file_path: string
    code_edit: string
    instructions: string
    timestamp: Date
    toolName: string
}

export interface ToolCallFile {
    relative_file_path: string
    code_edit: string
    instructions: string
}

export interface CodeMapping {
    currentFile: FileEdit | null
    editHistory: FileEdit[]
    fileList: Set<string>
}

export type DataPart = { type: 'append-message'; message: string };

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;
type webScraper = InferUITool<typeof webscraper>;
type webSearch = InferUITool<typeof web_search>;
type suggestion = InferUITool<typeof suggestions>;
type edit_file = InferUITool<ReturnType<typeof edit_file>>;
type grep = InferUITool<ReturnType<typeof grep>>;
type ls = InferUITool<ReturnType<typeof ls>>;
type glob = InferUITool<ReturnType<typeof glob>>;
type task_agent = InferUITool<ReturnType<typeof task_agent>>;
type bash = InferUITool<ReturnType<typeof bash>>;


export type ChatTools = {
  webScraper: webScraper;
  webSearch: webSearch;
  suggestion: suggestion;
  edit_file: edit_file;
  grep: grep;
  ls: ls;
  glob: glob;
  task_agent: task_agent;
  bash: bash;
};

export type CustomUIDataTypes = {
  textDelta: string;
  imageDelta: string;
  sheetDelta: string;
  codeDelta: string;
  appendMessage: string;
  id: string;
  title: string;
};

export type ChatMessage = UIMessage<
  MessageMetadata,
  CustomUIDataTypes,
  ChatTools
>;

export interface Attachment {
  name: string;
  url: string;
  contentType: string;
}