import type { UIMessage, Attachment } from "ai";
import MessageBox from "./Message-box";
import { SidebarProvider, SidebarInset } from "./ui/sidebar";
import SidebarComponent from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { useAi } from "~/hooks/use-ai";

function ChatContent({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
}) {
  const navigate = useNavigate();

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
    <SidebarInset className="relative flex h-full flex-1 flex-col overflow-hidden">
      {/* Subtle layered background */}
      <div className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-zinc-900" />

      {/* Ambient soft auras */}
      <div className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(70%_50%_at_50%_-10%,black,transparent)]">
        <div className="absolute left-1/4 top-0 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.12),transparent_60%)] blur-md" />
        <div className="absolute right-0 top-1/3 h-[22rem] w-[22rem] translate-x-1/4 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.10),transparent_60%)] blur" />
      </div>

      <div className="flex flex-1 items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-4xl translate-y-[-6vh] space-y-8 text-center md:translate-y-[-8vh]">
          <div className="space-y-3 md:space-y-4">
            <h1 className="bg-gradient-to-b from-white to-zinc-300/80 bg-clip-text text-4xl font-semibold text-transparent md:text-6xl">
              Make anything
            </h1>
            <p className="text-base text-zinc-400 md:text-lg">
              Build fullstack web apps by prompting
            </p>
          </div>

          <div className="mt-6 md:mt-10">
            <MessageBox
              input={input}
              status={status}
              handleInputChange={handleInputChange}
              handleSubmit={handleInitialSubmit}
            />
          </div>
        </div>
      </div>
    </SidebarInset>
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
