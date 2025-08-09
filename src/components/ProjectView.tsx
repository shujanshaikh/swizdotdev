"use client"
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


import Editor from "./code-editor/Editor";
import { getLatestEditFileData } from "~/lib/code-message/latest-edits";
import { getAllEditedFiles } from "~/lib/code-message/all-edited";
import { useAi } from "~/hooks/use-ai";
import type { ChatMessage } from "~/lib/types";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ProjectView({
  initialMessages,
  id,
  isLoading
}: {
  initialMessages: ChatMessage[];
  id: string;
  isLoading: boolean;
}) {
  console.log(initialMessages, "initialMessages")
 
  const {
    input,
    status,
    handleSubmit,
    messages,
    error,
    regenerate,
    setMessages,
    setInput,
    sendMessage,
  } = useAi({
    id,
    initialMessages,
  });
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      sendMessage({
        role: "user" as const,
        parts: [{ type: "text", text: query }],
      });
      setHasAppendedQuery(true);
      window.history.replaceState({}, "", `/project/${id}`);
    }
  }, [query, hasAppendedQuery, id, sendMessage]);
  const editFileData = getLatestEditFileData(messages);
  const allEditedFiles = getAllEditedFiles(messages);

    if(isLoading){
      return (
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-700 border-t-white"></div>
        </div>
      )
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
                regenerate={regenerate}
              />
            </div>
            <div className="flex-shrink-0 border-t border-zinc-700/50 p-4">
              <MessageBox
                input={input}
                status={status}
                handleSubmit={handleSubmit}
                setMessages={setMessages}
                messages={messages}
                setInput={setInput}
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
              <PreviewUrl projectId={id!} />
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
