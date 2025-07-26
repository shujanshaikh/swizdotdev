import { useParams } from "react-router-dom";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import MessageBox from "./Message-box";
import ProjectMessageView from "./ProjectMessage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import PreviewUrl from "./PreviewUrl";
import { AppWindowMac, Code2Icon } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { api } from "~/trpc/react";
import type { Attachment, UIMessage } from "ai";
import type { DBMessage } from "~/server/db/schema";
import Editor from "./code-editor/Editor";
import { type ToolCallFile } from "~/lib/types";

export default function ProjectView() {
  const { id } = useParams();

  function convertToUIMessages(messages: Array<DBMessage>): Array<UIMessage> {
    return messages.map((message) => ({
      id: message.id,
      parts: message.parts as UIMessage["parts"],
      role: message.role as UIMessage["role"],
      content: "",
      createdAt: message.createdAt,
      experimental_attachments:
        (message.attachments as Array<Attachment>) ?? [],
    }));
  }

  const { data: dbMessages, isLoading } =
    api.message.getMessagesByProjectId.useQuery(
      { projectId: id! },
      { enabled: !!id },
    );

  const initialMessages = dbMessages ? convertToUIMessages(dbMessages) : [];

  const {
    input,
    status,
    handleInputChange,
    handleSubmit,
    messages,
    error,
    reload,
  } = useChat({
    id,
    initialMessages,
    generateId: () => crypto.randomUUID(),
    api: "/api/agent",
    experimental_prepareRequestBody: (body) => ({
      message: body.messages.at(-1),
      id,
    }),
    experimental_throttle: 100,
    sendExtraMessageFields: true,
  });

  const { data: sandboxUrl } = api.message.getSandboxUrl.useQuery(
    { messageId: dbMessages?.at(-1)?.id ?? "" },
    { enabled: !!dbMessages?.at(-1)?.id },
  );

  const getAllEditedFiles = (): ToolCallFile[] => {
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

  const getLatestEditFileData = () => {
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

  const editFileData = getLatestEditFileData();
  const allEditedFiles = getAllEditedFiles();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-900">
        <div className="text-white">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal" className="h-screen">
        <ResizablePanel maxSize={40} minSize={20} defaultSize={30}>
          <div className="flex h-full flex-col bg-zinc-900">
            <div className="min-h-0 flex-1">
              <ProjectMessageView
                messages={messages}
                status={status}
                error={error}
                reload={reload}
              />
            </div>
            <div className="flex-shrink-0 border-t border-zinc-700/50 p-4">
              <MessageBox
                input={input}
                status={status}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
              />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle={false} />
        <ResizablePanel className="h-full">
          <Tabs defaultValue="app" className="h-full bg-zinc-900/50">
            <TabsList className="justify-center bg-zinc-900/50">
              <TabsTrigger value="app" className="border-none text-white">
                <AppWindowMac className="h-2 w-2" />
                App
              </TabsTrigger>
              <TabsTrigger value="editor" className="border-none text-white">
                <Code2Icon className="h-2 w-2" />
                Editor
              </TabsTrigger>
            </TabsList>
            <TabsContent value="app">
              <PreviewUrl sandboxUrl={sandboxUrl!} />
            </TabsContent>
            <TabsContent value="editor">
              <Editor
                code_edit={editFileData.code_edit}
                relative_file_path={editFileData.relative_file_path}
                editedFiles={allEditedFiles}
              />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
