"use client";

import { useEffect, useCallback, useState } from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import type { ChatMessage } from "~/lib/types";
import Error from "./ui/error";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileCode2, Terminal } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";

export default function ProjectMessageView({
  messages,
  status,
  error,
  regenerate: _regenerate,
  }: {
  messages: ChatMessage[];
  status: "submitted" | "streaming" | "ready" | "error";
  error: undefined | Error;
  regenerate: () => void;
}) {
  const router = useRouter();
  void _regenerate;
  const [isOpenGrep, setIsOpenGrep] = useState(false);
  const [isOpenTsc, setIsOpenTsc] = useState(false);
  const onhandleBack = useCallback(() => {
    router.push("/");
  }, [router]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" ||
        (event.altKey && event.key === "ArrowLeft")
      ) {
        event.preventDefault();
        onhandleBack();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onhandleBack]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="scrollbar-hide flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/30">
          <div className="mx-auto max-w-4xl px-2 py-2 sm:px-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onhandleBack}
                  variant="ghost"
                  size="sm"
                  aria-label="Go back"
                  className="gap-2 px-2"
                >
                  <ArrowLeft className="size-4" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={6}>Back (Esc)</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
          {messages.length === 0 ? (
            <div className="flex h-96 flex-col items-center justify-center text-center">
              <div className="text-lg text-gray-400">No messages yet</div>
              <div className="text-sm text-gray-500">
                Start a conversation to see your chat history!
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`${message.role === "user" ? "ml-auto max-w-[90%] sm:max-w-[80%] md:max-w-[75%]" : "w-full"}`}
                  >
                    {message.role === "user" ? (
                      <div className="rounded-2xl bg-zinc-800 px-4 py-3 text-white sm:px-5 sm:py-4">
                        {message.parts.map((part, partIndex) => (
                          <div key={partIndex}>
                            {part.type === "text" && (
                              <div className="text-[14px] leading-relaxed whitespace-pre-wrap sm:text-[15px]">
                                {part.text}
                              </div>
                            )}
                          </div>
                        ))}
                        {message.parts
                          ?.filter((part) => part.type === "file")
                          .map((part, index) => (
                            <Image
                              key={`${message.id}-${index}`}
                              src={part.url}
                              alt={part.filename!}
                              width={400}
                              height={400}
                              className="mt-4 h-auto w-full max-w-full cursor-pointer rounded-lg shadow-lg transition-opacity hover:opacity-90 sm:max-w-[400px]"
                              onClick={() => window.open(part.url, "_blank")}
                              priority
                            />
                          ))}
                      </div>
                    ) : (
                      <div className="w-full space-y-3 py-4">
                        {message.parts.map((part, partIndex) => {
                          const key = `message-${message.id}-part-${partIndex}`;
                          if (part.type === "text") {
                            return (
                              <div
                                key={key}
                                className="rounded-2xl bg-zinc-800/40 px-4 py-3 text-[14px] leading-relaxed text-gray-200 shadow-sm backdrop-blur sm:text-[15px]"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0">
                                   
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="whitespace-pre-wrap">
                                      {part.text}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          if (
                            part.type === "reasoning" &&
                            part.text?.trim().length > 0
                          ) {
                            return (
                              <div
                                key={key}
                                className="text-[14px] leading-relaxed whitespace-pre-wrap text-gray-200 sm:text-[15px]"
                              >
                                {part.text}
                              </div>
                            );
                          }

                          if (part.type === "tool-bash") {
                            const { toolCallId, state } = part;

                            if (state === "input-available") {
                              return (
                                <div
                                  key={toolCallId}
                                  className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2"
                                >
                                  <Terminal className="h-4 w-4 text-white" />
                                  <code className="font-mono text-sm text-emerald-400">
                                    $ {part.input.command}
                                  </code>
                                </div>
                            
                              )
                            }

                            if (state === "output-available") {
                              const { output } = part;
                              return (
                                <div
                                  key={toolCallId}
                                  className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800/50 p-3"
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <Terminal className="h-4 w-4 text-white" />
                                    <span className="text-xs font-medium text-zinc-400">
                                      Terminal 
                                    </span>
                                  </div>
                                  <pre className="font-mono text-sm text-zinc-300 whitespace-pre-wrap">
                                    {output}
                                  </pre>
                                </div>
                              );
                            }
                          }
                          if (part.type === "tool-webScraper") {
                            const { toolCallId, state } = part;

                            if (state === "input-available") {
                              return (
                                <div
                                  key={toolCallId}
                                  className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2"
                                >
                                  <svg
                                    className="h-4 w-4 text-zinc-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                    />
                                  </svg>
                                  <a
                                    href={part.input.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
                                  >
                                    {part.input.url}
                                  </a>
                                </div>
                              );
                            }

                            if (state === "output-available") {
                              const { output } = part;

                              return (
                                <div
                                  key={toolCallId}
                                  className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800/50 p-4"
                                >
                                  {output.data.length > 0 && output.data[0]?.screenshot && (
                                    <div className="space-y-4">
                                      <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-medium text-zinc-200">
                                          Screenshot Preview
                                        </h3>
                                      </div>
                                      <a
                                        href={output.data[0].screenshot}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block"
                                      >
                                        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                                          <Image
                                            src={output.data[0].screenshot}
                                            alt="Screenshot preview"
                                            fill
                                            className="object-cover"
                                            quality={90}
                                          />
                                        </div>
                                      </a>
                                    </div>
                                  )}
                                </div>
                              );
                            }
                          }

                          if (part.type === "tool-ls") {
                            const { toolCallId, state } = part;

                            if (state === "input-available") {
                              return (
                                <div
                                  key={toolCallId}
                                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-zinc-800/40 border border-zinc-700/50"
                                >
                                  <svg
                                    className="h-4 w-4 text-zinc-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none" 
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                                    />
                                  </svg>
                                  <span className="text-sm font-medium text-zinc-300">
                                    Listing directory: <span className="text-zinc-400 font-mono">{part.input.relative_dir_path}</span>
                                  </span>
                                </div>
                              );
                            }

                            // if (state === "output-available") {
                            //   const { output } = part;
                            //   return (
                            //     <div
                            //       key={toolCallId}
                            //       className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800/50 p-4"
                            //     >
                            //       <div className="mb-2 flex items-center gap-2">
                            //         <span className="text-sm font-medium text-zinc-400">
                            //           Directory Contents
                            //         </span>
                            //       </div>
                                  
                            //     </div>
                            //   );
                            // }
                          }

                          if (part.type === "tool-glob") {
                            const { toolCallId, state } = part;

                            if (state === "input-available") {
                              return (
                                <div
                                  key={toolCallId}
                                  className="text-[14px] leading-relaxed whitespace-pre-wrap text-gray-200 sm:text-[15px]"
                                >
                                  {part.input.pattern}
                                </div>
                              );
                            }

                            if (state === "output-available") {
                              const { output } = part;
                              return <div key={toolCallId}>{output}</div>;
                            }
                          }

                          if (part.type === "tool-edit_file") {
                            const { toolCallId, state } = part;

                            if (state === "output-available") {
                              return (
                                <div
                                  key={toolCallId}
                                  className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800/50 p-4"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-emerald-400">
                                      
                                      <FileCode2 className="h-4 w-4 text-white" />
                                    </span>
                                    <span className="text-md text-zinc-300">
                                      {part.input.relative_file_path}
                                    </span>
                                  </div>
                                </div>
                              );
                            }
                          }

                          if (part.type === "tool-read_file") {
                            const { toolCallId, state } = part;

                            if (state === "output-available") {
                              return (
                                <div
                                  key={toolCallId}
                                  className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800/50 p-4"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-emerald-400">
                                      Reading File:
                                    </span>
                                    <span className="text-xs text-zinc-300">
                                      {part.input.relative_file_path}
                                    </span>
                                  </div>
                                </div>
                              );
                            }
                          }


                          if (part.type === "tool-grep") {
                            const { toolCallId, state } = part;

                            if (state === "input-available") {
                              return (
                                <div
                                  key={toolCallId}
                                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-zinc-800/50 border border-zinc-700"
                                >
                                  <span className="text-sm font-medium text-zinc-400">Searching for:</span>
                                  <span className="text-sm text-gray-200">{part.input.query}</span>
                                </div>
                              );
                            }

                            if (state === "output-available") {
                              const { output } = part;
                              return (
                                <div 
                                  key={toolCallId}
                                  className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 mt-2"
                                >
                                  <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsOpenGrep(!isOpenGrep)}>
                                    <span className="text-sm font-medium text-zinc-300">Grepping for: {part.input.query}</span>
                                    <svg 
                                      className={`w-5 h-5 text-zinc-400 transition-transform ${isOpenGrep ? 'rotate-0' : 'rotate-180'}`}
                                      fill="none" 
                                      stroke="currentColor" 
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </div>
                                  
                                  <div className={`mt-2 overflow-hidden transition-all duration-200 ${isOpenGrep ? 'max-h-96' : 'max-h-0'}`}>
                                    <div className="text-[14px] leading-relaxed whitespace-pre-wrap text-gray-200 sm:text-[15px] rounded-md bg-zinc-900/50 p-3">
                                      {output}
                                    </div>
                                  </div>
                                </div>
                              );
                              
                            }
                          }

                          if (part.type === "tool-task_agent") {
                            const { toolCallId, state } = part;

                            if (state === "input-available") {
                              return (
                                <div
                                  key={toolCallId}
                                  className="text-[14px] leading-relaxed whitespace-pre-wrap text-gray-200 sm:text-[15px]"
                                >
                                  {part.input.prompt}
                                </div>
                              );
                            }

                            if (state === "output-available") {
                              const { output } = part;
                              return <div key={toolCallId}>{output}</div>;
                            }
                          }

                          if (part.type === "tool-webSearch") {
                            const { toolCallId, state } = part;

                            if (state === "input-available") {
                              return (
                                <div
                                  key={toolCallId}
                                  className="text-[15px] leading-relaxed whitespace-pre-wrap text-gray-200"
                                >
                                  {part.input.search_term}
                                </div>
                              );
                            }

                            if (state === "output-available") {
                              const { output } = part;
                              return (
                                <div key={toolCallId}>
                                  {output?.map((result) => (
                                    <div key={result.url}>
                                      <a
                                        href={result.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        {result.title}
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              );
                            }
                          }

                          if (part.type === "tool-string_replace") {
                            const { toolCallId, state } = part;

                            if (state === "input-available") {
                              return (
                                <div key={toolCallId}>
                                  {part.input.relative_file_path}
                                </div>
                              );
                            }
                            if (state === "output-available") {
                              const { output } = part;
                              return (
                                <div 
                                  key={toolCallId}
                                  className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800/50 p-4"
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <svg 
                                      className="h-4 w-4 text-zinc-400"
                                      xmlns="http://www.w3.org/2000/svg" 
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round" 
                                        strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                      />
                                    </svg>
                                    <span className="text-sm font-medium text-zinc-300">
                                      String Replace Results
                                    </span>
                                  </div>
                                  <pre className="text-sm text-zinc-400 font-mono whitespace-pre-wrap">
                                    {output}
                                  </pre>
                                </div>
                              );
                            }
                          }

                          if (part.type === "tool-run_tsccheck") {

                            const { toolCallId, state } = part;


                            if (state === "input-available") {
                              const { input } = part;
                              return (
                                <div key={toolCallId}>
                                  {input.relative_file_path}
                                </div>
                              );
                            }

                            if (state === "output-available") {
                              const { output } = part;
                              return (
                                <div 
                                  key={toolCallId}
                                  className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800/50 p-4"
                                >
                                  <div 
                                    className="flex items-center gap-2 mb-2 cursor-pointer"
                                    onClick={() => setIsOpenTsc(!isOpenTsc)}
                                  >
                                    <svg 
                                      className={`h-4 w-4 text-zinc-400 transition-transform ${isOpenGrep ? 'rotate-180' : ''}`}
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24" 
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                      />
                                    </svg>
                                    <span className="text-sm font-medium text-zinc-300">
                                      TypeScript Check Results
                                    </span>
                                  </div>
                                  {isOpenTsc && (
                                    <pre className="text-sm text-zinc-400 font-mono whitespace-pre-wrap">
                                      {output}
                                    </pre>
                                  )}
                                </div>
                              );
                            }
                          }
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {status === "submitted" && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 py-4">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400" />
                    <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400 delay-100" />
                    <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400 delay-200" />
                  </div>
                </div>
              )}

              {status === "error" && error && <Error message={error.message} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
