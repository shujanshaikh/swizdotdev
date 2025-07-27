import type { UIMessage, Attachment } from "ai";
import MessageBox from "./Message-box";
import { SidebarProvider, useSidebar } from "./ui/sidebar";
import SidebarComponent from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { PanelLeft } from "lucide-react";
import { useAi } from "~/hooks/use-ai";

function ChatContent({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
}) {
  const navigate = useNavigate();
  const { open, toggleSidebar } = useSidebar();

  const { input, status, handleInputChange, handleSubmit } = useAi({
    id,
    initialMessages,
  });

  const handleInitialSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    options: { experimental_attachments: Attachment[] },
  ) => {
    e.preventDefault();
    if (!input.trim() || status === "streaming") return;

    handleSubmit(e, options);

    navigate(`/project/${id}`);
  };

  return (
    <div className="flex h-full flex-1 flex-col bg-gradient-to-b from-zinc-950 to-zinc-900">
      {/* Toggle button when sidebar is closed */}
      {!open && (
        <div className="absolute top-4 left-4 z-50">
          <button
            onClick={toggleSidebar}
            className="rounded-lg bg-zinc-800 p-2 text-zinc-300 shadow-lg transition-colors hover:bg-zinc-700 hover:text-white"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-4xl space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white md:text-6xl">
              Make anything
            </h1>
            <p className="text-lg text-zinc-400">
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
  );
}

export default function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full">
        <SidebarComponent />
        <ChatContent id={id} initialMessages={initialMessages} />
      </div>
    </SidebarProvider>
  );
}
