import { useChat } from "@ai-sdk/react";
import type { UIMessage, Attachment } from "ai";
import MessageBox from "./Message-box";
import { SidebarProvider } from "./ui/sidebar";
import SidebarComponent from "./Sidebar";
import { useNavigate } from "react-router-dom";

export default function Chat({
  id,
  initialMessages,
}: {
  id: string,
  initialMessages: Array<UIMessage>;
}) {
  const navigate = useNavigate();
  
  const { input, status, handleInputChange, handleSubmit } = useChat({
    id,
    initialMessages,
    generateId : () => crypto.randomUUID(),
    api: "/api/agent",
    experimental_prepareRequestBody: (body) => ({
      message: body.messages.at(-1),
      id,
    }),
    sendExtraMessageFields: true,
  });

  const handleInitialSubmit = async (e: React.FormEvent<HTMLFormElement>, options: { experimental_attachments: Attachment[] }) => {
    e.preventDefault();
    if (!input.trim() || status === 'streaming') return;
    
    handleSubmit(e, options);
    
   
      navigate(`/project/${id}`);
  };
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <SidebarComponent/>
        <div className="flex-1 min-h-screen bg-gradient-to-b from-black to-white/20 flex items-start justify-center pt-45 p-4 select-none">
          <div className="w-full max-w-4xl text-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-6xl font-semibold text-white select-none">
                Make anything
              </h1>
              <p className="text-lg text-gray-400 select-none">
                Build fullstack web apps by prompting
              </p>
            </div>
            
            <div className="mt-12">
              <MessageBox 
                input={input}
                status={status}
                handleInputChange={handleInputChange}
                handleSubmit={handleInitialSubmit}
              />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
