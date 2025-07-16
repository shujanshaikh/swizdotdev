import { useParams } from "react-router-dom";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import MessageBox from "./Message-box";
import { useState } from "react";
import ProjectMessageView from "./ProjectMessage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import PreviewUrl from "./PreviewUrl";
import { AppWindowMac, Code2Icon } from "lucide-react";

export default function ProjectView() {
  const { id } = useParams();
  console.log(id);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("ready");
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    const response = await fetch("/api/agent", {
      method: "POST",
      body: JSON.stringify({ input }),
    });
    const data = await response.json();
    console.log(data);
    setStatus("success");
    setInput("");
  };
  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal" className="h-screen">
        <ResizablePanel maxSize={40} minSize={20} defaultSize={30}>
          <div className="flex h-full flex-col bg-zinc-900">
            <div className="flex-1">
              <ProjectMessageView />
            </div>
            <div className="p-4">
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
              <PreviewUrl />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
