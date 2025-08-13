"use client";
import MessageBox from "./Message-box";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "./ui/sidebar";
import SidebarComponent from "./Sidebar";
import { useAi } from "~/hooks/use-ai";
import type { ChatMessage } from "~/lib/types";
import { useIsMobile } from "~/hooks/use-mobile";

function ChatContent({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: ChatMessage[];
}) {
  const { input, status, setInput, messages, setMessages } =
    useAi({
      id,
      initialMessages,
    });

  const handleInitialSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    //options: { experimental_attachments: Attachment[] },
  ) => {


    e.preventDefault();
    if (!input.trim() || status === "streaming") return;
    const q = encodeURIComponent(input.trim());
    window.location.replace(`/project/${id}?query=${q}`);
  };



  return (
    <SidebarInset className="relative flex h-full flex-1 flex-col overflow-hidden bg-transparent">
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-900" />

      <div className="pointer-events-none absolute inset-0 z-0 [mask-image:radial-gradient(70%_50%_at_50%_-10%,black,transparent)]">
        <div className="absolute top-0 left-1/4 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.25),transparent_60%)] blur-2xl" />
        <div className="absolute top-1/3 right-0 h-[24rem] w-[24rem] translate-x-1/4 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.20),transparent_60%)] blur-2xl" />
      </div>


      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:22px_22px]" />

      <div className="relative z-10 flex flex-1 items-center justify-center p-6 md:p-10">
        {/* Mobile sidebar trigger */}
        <div className="absolute left-4 top-4 md:hidden">
          <SidebarTrigger className="rounded-xl border border-white/10 bg-zinc-900/70 backdrop-blur hover:bg-zinc-800/70" />
        </div>
        <div className="w-full max-w-4xl translate-y-[-6vh] space-y-8 text-center md:translate-y-[-8vh]">
          <div className="space-y-3 md:space-y-4">
            <h1 className="bg-gradient-to-b from-white via-zinc-200 to-zinc-400 bg-clip-text text-4xl font-semibold tracking-tight text-transparent md:text-6xl">
              Make anything
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
              Build full‑stack web apps by prompting
            </p>
          </div>

          <div className="mt-6 md:mt-10">
            <MessageBox
              input={input}
              status={status}
              setMessages={setMessages}
              handleSubmit={handleInitialSubmit}
              messages={messages}
              setInput={setInput}
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
  initialMessages: ChatMessage[];
}) {
  const isMobile = useIsMobile();
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex h-screen w-full">
        <SidebarComponent />
        <ChatContent id={id} initialMessages={initialMessages} />
      </div>
    </SidebarProvider>
  );
}
