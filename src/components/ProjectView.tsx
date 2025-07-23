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

export default function ProjectView() {
  const { id } = useParams();

  function convertToUIMessages(messages: Array<DBMessage>): Array<UIMessage> {
    return messages.map((message) => ({
        id: message.id,
        parts: message.parts as UIMessage['parts'],
        role: message.role as UIMessage['role'],
        content: '',
        createdAt: message.createdAt,
        experimental_attachments:
            (message.attachments as Array<Attachment>) ?? [],
    }));
}
 
  const { data: dbMessages, isLoading } = api.message.getMessagesByProjectId.useQuery(
    { projectId: id! },
    { enabled: !!id }
  );

  const initialMessages = dbMessages ? convertToUIMessages(dbMessages) : [];

  const { input, status, handleInputChange, handleSubmit, messages , error , reload } = useChat({
    id,
    initialMessages,
    generateId : () => crypto.randomUUID(),
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
    { enabled: !!dbMessages?.at(-1)?.id }
  )

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-900">
        <div className="text-white">Loading messages...</div>
      </div>
    );
  }
  
  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal" className="h-screen">
        <ResizablePanel maxSize={40} minSize={20} defaultSize={30}>
          <div className="flex h-full flex-col bg-zinc-900 ">
            <div className="flex-1 min-h-0">
              <ProjectMessageView messages={messages} status={status} error={error} reload={reload}/>
            </div>
            <div className="flex-shrink-0 p-4 border-t border-zinc-700/50">
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
          <Tabs defaultValue="app" className="h-full bg-zinc-900">
            <TabsList className="justify-center bg-zinc-900">
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
              <Editor />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
