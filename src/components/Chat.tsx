"use client";
import MessageBox from "./Message-box";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "./ui/sidebar";
import SidebarComponent from "./Sidebar";
import { useAi } from "~/hooks/use-ai";
import type { ChatMessage } from "~/lib/types";
import { useIsMobile } from "~/hooks/use-mobile";
import Link from "next/link";
import { Button } from "./ui/button";
import { authClient } from "~/lib/auth-client";

function ChatContent({
  initialMessages,
}: {
  initialMessages: ChatMessage[];
}) {
  const { data: session } = authClient.useSession();
  const { input, status, setInput, messages, setMessages, files, setFiles } =
    useAi({
      initialMessages,
    });

  const handleInitialSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    if (!input.trim() || status === "streaming") return;

    const q = encodeURIComponent(input.trim());
    const newId = crypto.randomUUID();
    window.location.replace(`/project/${newId}?query=${q}`);
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
        <div className="absolute top-4 left-4 md:hidden">
          <SidebarTrigger className="rounded-xl border border-white/10 bg-zinc-900/70 backdrop-blur hover:bg-zinc-800/70" />
        </div>
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Button asChild variant="ghost">
            {session ? (
              <Link href="/">Welcome {session.user?.name}</Link>
            ) : (
              <Link href="/login">Log in</Link>
            )}
          </Button>
          {session ? (
            <Button
              asChild
              variant="default"
              onClick={() => authClient.signOut()}
            >
              <Link href="/signup">Sign out</Link>
            </Button>
          ) : (
            <Button asChild variant="default">
              <Link href="/signup">Sign up</Link>
            </Button>
          )}
        </div>
        <div className="w-full max-w-4xl translate-y-[-6vh] space-y-8 text-center md:translate-y-[-8vh]">
          <div className="space-y-6 md:space-y-8">
            <div className="flex items-center justify-center">
              <div className="relative flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/50 px-3 py-2 backdrop-blur sm:flex-row sm:gap-3 sm:rounded-full sm:px-4 sm:py-1.5">
                <span className="text-xs font-medium text-zinc-300 sm:text-sm">Made by Shujan Shaikh</span>
                <div className="hidden h-4 w-px bg-white/10 sm:block" />
                <a
                  href="https://x.com/shujanshaikh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-1.5 rounded-full bg-zinc-800/50 px-2.5 py-1 text-zinc-400 transition-all hover:bg-zinc-800 hover:text-zinc-200 sm:bg-transparent sm:px-0 sm:py-0"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="transition-transform group-hover:scale-110 sm:h-3.5 sm:w-3.5">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span className="text-xs sm:text-sm">@shujanshaikh</span>
                </a>
                <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity [background:radial-gradient(100%_50%_at_50%_0%,rgba(244,244,245,0.05),transparent)] group-hover:opacity-100 sm:rounded-full" />
              </div>
            </div>

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
                files={files}
                setFiles={setFiles}
              />
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}

export default function Chat({
  initialMessages,
}: {
  initialMessages: ChatMessage[];
}) {
  const isMobile = useIsMobile();
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex h-screen w-full">
        <SidebarComponent />
        <ChatContent initialMessages={initialMessages} />
      </div>
    </SidebarProvider>
  );
}
