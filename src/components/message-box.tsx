"use client";
import { useEffect, useRef } from "react";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";
import { UploadButton } from "~/utils/uploadthing";
import Image from "next/image";
import { Paperclip } from "lucide-react";
import type { ChatMessage } from "~/lib/types";
import type { UseChatHelpers } from "@ai-sdk/react";
import type { FileUIPart } from "ai";
import { authClient } from "~/lib/auth-client";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import Stop from "./ui/stop";
import ModelSelector from "./model-selector";

export default function MessageBox({
  input,
  status,
  handleSubmit,
  setInput,
  files,
  setFiles,
  model,
  setModel,
  stop,
}: {
  input: string;
  status: string;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  messages: ChatMessage[];
  setInput: (input: string) => void;
  files: FileUIPart[];
  setFiles: (files: FileUIPart[]) => void;
  model: string;
  setModel: (model: string) => void;
  stop: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { data: session } = authClient.useSession();

  // Auto-resize functionality
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
    
    setInput(e.target.value);
  };

  const removeAttachment = (index: number, prev: FileUIPart[]) => {
    setFiles(prev.filter((_, i) => i !== index));
  };

  return (
    <form
      onSubmit={(event) => {
        handleSubmit(event);
      }}
      className="relative mx-auto max-w-3xl px-3"
    >
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-xl",
          "transition-all duration-300 ease-in-out",
        )}
      >
        {/* Attachments inside message box */}
        {files.length > 0 && (
          <div className="border-b border-white/10 p-3">
            <div className="flex flex-wrap gap-2.5">
              {files.map((attachment, index) => (
                <div
                  key={index}
                  className="group/att relative flex max-w-[220px] items-center gap-2 rounded-xl bg-white/5 px-2.5 py-2 ring-1 ring-white/10 transition-colors duration-200 hover:bg-white/10"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-white/10 ring-1 ring-white/10">
                      {attachment.mediaType?.startsWith("image/") ? (
                        <Image
                          src={attachment.url}
                          alt={attachment.filename || "attachment"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <svg
                            className="h-5 w-5 text-zinc-300/80"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <span className="truncate text-sm font-medium text-zinc-100/90">
                      {attachment.filename || "Unnamed file"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index, files)}
                    className="ml-1.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-300 transition-all duration-200 hover:bg-red-500/70 hover:text-white"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <textarea
          value={input}
          onChange={handleTextareaChange}
          placeholder="Tell swiz what you want to build..."
          className={cn(
            "max-h-[260px] min-h-[130px] w-full bg-transparent px-5 py-6 pr-24 text-white placeholder:text-white/50",
            "rounded-2xl",
            "resize-none overflow-hidden text-base leading-relaxed",
            "transition-all duration-200 focus:outline-none",
            "scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/30",
            files.length > 0 ? "rounded-t-none pt-4" : "",
          )}
          ref={textareaRef}
        />

        <div className="absolute bottom-3 left-3">
          <UploadButton
            disabled={!session}
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              if (!res) return;
              const newAttachments = res.map((file) => ({
                filename: file.name,
                url: file.ufsUrl,
                contentType: file.type,
                type: "file",
                mediaType: file.type,
              }));
              setFiles(newAttachments as unknown as FileUIPart[]);
            }}
            onUploadError={(error: Error) => {
              console.log(error);
            }}
            appearance={{
              button: cn(
                "h-9 w-9 rounded-xl bg-white/5 text-white/80 ring-1 ring-white/10",
                "transition-all duration-200 hover:bg-white/10 hover:text-white",
                "flex items-center justify-center border-none",
                "focus:outline-none",
              ),
              allowedContent: "hidden",
            }}
            content={{
              button: <Paperclip className="h-5 w-5" />,
            }}
          />
        </div>
 

       <ModelSelector model={model} setModel={setModel} />
        <div className="absolute right-3 bottom-3">
          {!session ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="inline-flex">
                  <Button
                    type="submit"
                    disabled
                    className={cn(
                      "h-10 w-10 rounded-xl",
                      "bg-white/90 text-zinc-900 shadow-md ring-1 ring-black/5",
                      "hover:bg-white hover:shadow-lg",
                      "flex items-center justify-center border-none transition-all duration-200",
                      "select-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                      "hover:scale-[1.03] active:scale-95",
                    )}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform duration-200"
                    >
                      <path d="M12 19V5M5 12l7-7 7 7" />
                    </svg>
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent sideOffset={6}>
                <div className="flex items-center gap-2">
                  <span>Login or Signup to continue</span>
                  <Link href="/login" className="underline underline-offset-2">Login</Link>
                  <span>·</span>
                  <Link href="/signup" className="underline underline-offset-2">Signup</Link>
                </div>
              </TooltipContent>
            </Tooltip>
          ) : (
            (status === 'submitted' || status === 'streaming') ? (
              <Stop stop={stop} />
            ) : (
            <Button

              type="submit"
              disabled={status !== "ready" || !input.trim()}
              className={cn(
                "h-10 w-10 rounded-xl",
                "bg-white/90 text-zinc-900 shadow-md ring-1 ring-black/5",
                "hover:bg-white hover:shadow-lg",
                "flex items-center justify-center border-none transition-all duration-200",
                "select-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                "hover:scale-[1.03] active:scale-95",
              )}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-200"
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </Button>
            )
          )}
        </div>
      </div>
    </form>
  );
}
