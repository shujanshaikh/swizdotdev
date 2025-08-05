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
import { api } from "~/trpc/react";
import type { Attachment, UIMessage } from "ai";
import type { DBMessage } from "~/server/db/schema";
import Editor from "./code-editor/Editor";
import { getLatestEditFileData } from "~/lib/code-message/latest-edits";
import { getAllEditedFiles } from "~/lib/code-message/all-edited";
import { useAi } from "~/hooks/use-ai";

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
  } = useAi({
    id,
    initialMessages,
  });
  const editFileData = getLatestEditFileData(messages);
  const allEditedFiles = getAllEditedFiles(messages);

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
