"use client"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import MessageBox from "./message-box";
import ProjectMessageView from "./project-message";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import PreviewUrl from "./preview-url";
import { AppWindowMac, Code2Icon, ArrowLeft } from "lucide-react";
import Link from "next/link";


import Editor from "./code-editor/editor";
import { getLatestEditFileData } from "~/lib/code-message/latest-edits";
import { getAllEditedFiles } from "~/lib/code-message/all-edited";
import { useAi } from "~/hooks/use-ai";
import type { ChatMessage } from "~/lib/types";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useIsMobile } from "~/hooks/use-mobile";

export default function ProjectView({
  initialMessages,
  id,
  isLoading,
}: {
  initialMessages: ChatMessage[];
  id: string;
  isLoading: boolean;
}) {
 
  const {
    input,
    status,
    handleSubmit,
    messages,
    files,
    setFiles,
    error,
    regenerate,
    setMessages,
    setInput,
    sendMessage,
    model,
    setModel,
    stop
  } = useAi({
    id,
    initialMessages,
  });
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const models = searchParams.get("model");
  const file = searchParams.get("files");
  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      const parts: Array<{ type: "text"; text: string } | { type: "file"; url: string; filename: string; mediaType: string }> = [
        { type: "text", text: query },
      ];

      if (file && file.trim().length > 0) {
        parts.push({
          type: "file",
          url: file,
          filename: file,
          mediaType: "image/png",
        });
      }

      sendMessage(
        {
          role: "user" as const,
          parts,
        },
        {
          body: {
            model: models,
          },
        }
      );
      setHasAppendedQuery(true);
      window.history.replaceState({}, "", `/project/${id}`);
    }
  }, [query, hasAppendedQuery, id, sendMessage , models , file]);
  const editFileData = getLatestEditFileData(messages);
  const allEditedFiles = getAllEditedFiles(messages);
  const isMobile = useIsMobile();

    if(isLoading){
      return (
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-700 border-t-white"></div>
        </div>
      )
    }

  if (isMobile) {
    return (
      <div className="flex h-screen flex-col">
        <Tabs defaultValue="chat" className="flex h-full flex-col bg-zinc-900/50">
          <TabsList className="sticky top-0 z-10 flex gap-2 bg-zinc-900/50 p-2">
            <TabsTrigger value="chat" className="flex-1 border-none text-white">Chat</TabsTrigger>
            <TabsTrigger value="app" className="flex-1 border-none text-white">App</TabsTrigger>
            <TabsTrigger value="editor" className="flex-1 border-none text-white">Editor</TabsTrigger>
          </TabsList>
          <TabsContent value="chat" className="flex-1 data-[state=active]:flex data-[state=active]:flex-col min-h-0">
            <div className="flex h-full flex-col bg-zinc-900">
              <div className="min-h-0 flex-1">
                <ProjectMessageView
                  messages={messages}
                  status={status}
                  error={error}
                  regenerate={regenerate}
                />
              </div>
              <div className="flex-shrink-0 border-t border-zinc-700/50 p-3">
                <MessageBox
                  input={input}
                  status={status}
                  handleSubmit={handleSubmit}
                  setMessages={setMessages}
                  messages={messages}
                  setInput={setInput}
                  files={files}
                  setFiles={setFiles}
                  model={model}
                  setModel={setModel}
                  stop={stop}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="app" className="flex-1 min-h-0 data-[state=active]:block">
            <PreviewUrl projectId={id!} />
          </TabsContent>
          <TabsContent value="editor" className="flex-1 min-h-0 data-[state=active]:block">
            <Editor
              code_edit={editFileData.code_edit}
              relative_file_path={editFileData.relative_file_path}
              editedFiles={allEditedFiles}
            />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
   
    <div className="h-screen">
      <div className="h-full overflow-hidden rounded-none border border-zinc-800/60 bg-zinc-900/50 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/40">
        <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel maxSize={40} minSize={20} defaultSize={30}>
          <div className="flex h-full flex-col bg-transparent">
            <div className="sticky top-0 z-10 flex h-12 items-center justify-between gap-2 border-b border-zinc-800/60 bg-transparent px-3">
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="text-zinc-300 hover:text-white inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-zinc-800/50"
                  aria-label="Back to home"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <div className="text-sm font-medium text-zinc-200">Conversation</div>
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <ProjectMessageView
                messages={messages}
                status={status}
                error={error}
                regenerate={regenerate}
              />
            </div>
            <div className="flex-shrink-0 border-t border-zinc-800/60 p-4">
              <MessageBox
                input={input}
                status={status}
                handleSubmit={handleSubmit}
                setMessages={setMessages}
                messages={messages}
                setInput={setInput}
                files={files}
                setFiles={setFiles}
                model={model}
                setModel={setModel}
                stop={stop}
              />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle={false} className="bg-transparent after:bg-transparent" />
        <ResizablePanel className="h-full" defaultSize={70} minSize={40} maxSize={80}>
          <Tabs defaultValue="app" className="flex h-full flex-col gap-0 bg-transparent">
            <div className="sticky top-0 z-10 flex h-12 items-center justify-center gap-2 border-b border-zinc-800/60 bg-transparent px-3">
              <TabsList className="flex w-fit items-center gap-2 border-none bg-zinc-800/60 p-1">
                <TabsTrigger value="app" className="flex items-center gap-2 px-3 py-2 text-white border-none hover:bg-zinc-800 data-[state=active]:bg-zinc-700">
                  <AppWindowMac className="h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="editor" className="flex items-center gap-2 px-3 py-2 text-white border-none hover:bg-zinc-800 data-[state=active]:bg-zinc-700">
                  <Code2Icon className="h-4 w-4" />
                  Editor
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="app" className="flex-1 min-h-0 data-[state=active]:flex overflow-hidden">
              <PreviewUrl projectId={id!} />
            </TabsContent>
            <TabsContent value="editor" className="flex-1 min-h-0 data-[state=active]:flex">
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
    </div>
  );
}
