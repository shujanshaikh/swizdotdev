"use client";

import React, { useState } from "react";
import Image from "next/image";
import type { ChatMessage } from "~/lib/types";
import Error from "./ui/error";
import { Terminal, ChevronDown, Brain } from "lucide-react";
import { getFileIcon } from "./icons";
import { audiowide } from "~/lib/font";


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
 
  void _regenerate;
  const [isOpenGrep, setIsOpenGrep] = useState(false);
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});

  const toggleReasoning = (key: string) => {
    setExpandedReasoning((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="scrollbar-hide flex-1 overflow-y-auto">
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
                    className={`${message.role === "user" ? "ml-auto min-w-0 max-w-[90%] sm:max-w-[80%] md:max-w-[75%]" : "w-full min-w-0"}`}
                  >
                    {message.role === "user" ? (
                      <div className="rounded-2xl bg-zinc-800 px-5 py-4 text-white shadow-sm">
                        {message.parts.map((part, partIndex) => (
                          <div key={partIndex} className="flex flex-col gap-2">
                            {part.type === "text" && (
                              <div className="text-[15px] leading-relaxed whitespace-pre-wrap text-zinc-100 break-words overflow-hidden">
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
                      <div className={`text-3xl  tracking-tight text-white ${audiowide.className}`}>
                          swiz
                        </div>

                        {message.parts.map((part, partIndex) => {
                          const key = `message-${message.id}-part-${partIndex}`;

                          if (part.type === "text") {
                            const paragraphs = part.text
                              ?.split(/\n{2,}/)
                              .map((paragraph) => paragraph.trimEnd())
                              .filter((paragraph) => paragraph.length > 0) ?? [""];

                            return (
                              <div
                                key={key}
                                className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-[15px] leading-relaxed text-zinc-200 shadow-sm"
                              >
                                <div className="space-y-3 text-[15px] leading-7 text-zinc-100">
                                  {paragraphs.map((paragraph, paragraphIndex) => (
                                    <p
                                      key={`${key}-paragraph-${paragraphIndex}`}
                                      className="whitespace-pre-wrap break-words">
                                      {paragraph}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            );
                          }

                    

                          if (part.type === "reasoning") {
                            const isStreaming = part.state === "streaming";
                            const isDone = part.state === "done";
                            const isExpanded = expandedReasoning[key];

                            if (isStreaming) {
                              return (
                                <div
                                  key={key}
                                  className="rounded-xl border border-zinc-700/60 bg-zinc-800/50 px-4 py-3 text-[14px] leading-relaxed text-zinc-200 shadow-sm"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-zinc-700/70 bg-zinc-900/70 animate-pulse">
                                      <Brain className="h-4 w-4 text-zinc-300" />
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-2">
                                      <div className="text-sm font-medium text-zinc-200">Thinking</div>
                                      <div className="max-h-48 overflow-y-auto pr-1 text-[13px] leading-6 text-zinc-300 scrollbar-elegant">
                                        <p className="whitespace-pre-wrap break-words">
                                          {part.text || "Working through the next steps…"}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            }

                            if (isDone) {
                              return (
                                <div
                                  key={key}
                                  className="rounded-xl px-4 py-3 text-[14px] text-zinc-200 border border-zinc-800 bg-zinc-900/70 "
                                >
                                  <div className="flex items-center justify-between ">
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ">
                                        <Brain className="h-4 w-4 text-zinc-300" />
                                      </div>
                                      <div>
                                        <div className="text-sm font-medium text-zinc-200">
                                          Reasoning 
                                        </div>
                                      
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => toggleReasoning(key)}
                                      className="inline-flex items-center gap-1 rounded-md  px-2.5 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-800"
                                    >
                                     
                                      <ChevronDown
                                        className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : "rotate-0"}`}
                                      />
                                    </button>
                                  </div>
                                  <div
                                    className={`mt-3 overflow-hidden transition-all duration-300 ease-out ${
                                      isExpanded ? "max-h-[600px]" : "max-h-0"
                                    }`}
                                  >
                                    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-3 text-[13px] text-zinc-300">
                                      <div className="max-h-64 overflow-y-auto pr-1 scrollbar-elegant">
                                        <pre className="whitespace-pre-wrap break-words font-sans text-[13px] text-zinc-300/90">
                                          {part.text?.trim() || "No reasoning steps available."}
                                        </pre>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            }

                            return null;
                          }

                          if (part.type === "tool-bash") {
                            const { toolCallId, state } = part;

                            if (state === "input-streaming") {
                              return (
                                <div key={toolCallId} className="flex items-center gap-2 px-4 py-2">
                                  <span className="text-sm font-medium text-zinc-300">Running Command:</span>
                                  <div
                                    className="inline-flex items-center gap-2 rounded-2xl bg-zinc-800/20 px-3 py-2 shadow-lg backdrop-blur-sm ring-1 ring-white/10"
                                  >
                                    <code className="font-mono text-sm text-zinc-200 break-all">
                                      $ {part.input?.command || 'Unknown command'}

                                    </code>
                                  </div>
                                </div>
                              );
                            }

                            if (state === "input-available") {
                              return (
                                <div
                                  key={toolCallId}
                                  className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2"
                                >
                                  <Terminal className="h-4 w-4 text-white" />
                                  <code className="font-mono text-sm text-zinc-200 break-all">
                                    $ {part.input?.command || 'Unknown command'}
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
                                  <pre className="font-mono text-sm text-zinc-300 whitespace-pre-wrap break-words overflow-x-auto">
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
                                    href={part.input?.url || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-400 hover:text-blue-300 hover:underline break-all"
                                  >
                                    {part.input?.url || 'Unknown URL'}
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
                                  {output  && (
                                    <div className="space-y-4">
                                      <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-medium text-zinc-200">
                                          Screenshot Preview
                                        </h3>
                                      </div>
                                      <a
                                        href={output}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block"
                                      >
                                        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                                          <Image
                                            src={output}
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

                          // if (part.type === "tool-ls") {
                          //   const { toolCallId, state } = part;

                          //   if (state === "input-available") {
                          //     return (
                          //       <div
                          //         key={toolCallId}
                          //         className="flex items-center gap-2 px-3 py-2 rounded-md bg-zinc-800/40 border border-zinc-700/50"
                          //       >
                          //         <svg
                          //           className="h-4 w-4 text-zinc-400"
                          //           xmlns="http://www.w3.org/2000/svg"
                          //           fill="none" 
                          //           viewBox="0 0 24 24"
                          //           stroke="currentColor"
                          //         >
                          //           <path
                          //             strokeLinecap="round"
                          //             strokeLinejoin="round"
                          //             strokeWidth={2}
                          //             d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                          //           />
                          //         </svg>
                          //         <span className="text-sm font-medium text-zinc-300">
                          //           Listing directory: <span className="text-zinc-400 font-mono">{part.input.relative_dir_path}</span>
                          //         </span>
                          //       </div>
                          //     );
                          //   }

                          //   if (state === "output-available") {
                          //     const { output } = part;
                          //     return (
                          //       <div
                          //         key={toolCallId}
                          //         className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800/50 p-4"
                          //       >
                          //         <div className="mb-2 flex items-center gap-2">
                          //           <span className="text-sm font-medium text-zinc-400">
                          //             Directory Contents: {output}
                          //           </span>
                          //         </div>

                          //       </div>
                          //     );
                          //   }
                          // }

                          if (part.type === "tool-glob") {
                            const { toolCallId, state } = part;

                            if (state === "input-available") {
                              return (
                                <div
                                  key={toolCallId}
                                  className="text-[14px] leading-relaxed whitespace-pre-wrap break-words text-gray-200 sm:text-[15px]"
                                >
                                  {part.input?.pattern || 'Unknown pattern'}
                                </div>
                              );
                            }

                            if (state === "output-available") {
                              const { output } = part;
                              return <div key={toolCallId} className="text-[14px] leading-relaxed whitespace-pre-wrap break-words text-gray-200 sm:text-[15px]">{output}</div>;
                            }
                          }

                          if (part.type === "tool-edit_file") {
                            const { toolCallId, state } = part;

                            if (state === "input-streaming") {
                              return (
                                <div key={toolCallId} className="flex items-center gap-2 px-4 py-2">

                                  <span className="text-sm font-medium text-zinc-300">Editing File.....</span>

                                  <div
                                    className="inline-flex items-center gap-2 rounded-2xl bg-zinc-800/20 px-3 py-2 shadow-lg backdrop-blur-sm ring-1 ring-white/10"
                                  >
                                    <span className="text-md text-zinc-300 hover:text-white transition-colors duration-200 break-all">
                                      {part.input?.relative_file_path || 'Unknown file'}
                                    </span>

                                  </div>
                                </div>
                              );
                            }


                            if (state === "output-available") {
                              return (
                                <div key={toolCallId} className="flex items-center gap-2 px-4 py-2">
                                  <span className="text-sm font-medium text-zinc-300">Edited File:</span>

                                  <div
                                    className="inline-flex items-center gap-2 rounded-2xl bg-zinc-800/20 px-3 py-2 shadow-lg backdrop-blur-sm ring-1 ring-white/10"
                                  >
                                    {getFileIcon(part.input?.relative_file_path || '')}
                                    <span className="text-md text-zinc-300 hover:text-white transition-colors duration-200 break-all">
                                      {part.input?.relative_file_path || 'Unknown file'}
                                    </span>
                                  </div>
                                </div>
                              );
                            }
                          }

                          if (part.type === "tool-read_file") {
                            const { toolCallId, state } = part;
                            if (state === "input-streaming") {
                              return (
                                <div key={toolCallId} className="flex items-center gap-2 px-4 py-2">
                                  <span className="text-sm font-medium text-zinc-300">Reading File.....</span>

                                  <div
                                    className="inline-flex items-center gap-2 rounded-2xl bg-zinc-800/20 px-3 py-2 shadow-lg backdrop-blur-sm ring-1 ring-white/10"
                                  >
                                    <span className="text-md text-zinc-300 hover:text-white transition-colors duration-200 break-all">
                                      {part.input?.relative_file_path || 'Unknown file'}
                                    </span>
                                  </div>
                                </div>
                              );
                            }

                            if (state === "output-available") {
                              return (
                                <div key={toolCallId} className="flex items-center gap-2 px-4 py-2">
                                  <span className="text-sm font-medium text-zinc-300">Read File</span>

                                  <div
                                    className="inline-flex items-center gap-2 rounded-2xl bg-zinc-800/20 px-3 py-2 shadow-lg backdrop-blur-sm ring-1 ring-white/10"
                                  >
                                    {getFileIcon(part.input?.relative_file_path || '')}
                                    <span className="text-md text-zinc-300 hover:text-white transition-colors duration-200 break-all">
                                      {part.input?.relative_file_path || 'Unknown file'}
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
                                  <span className="text-sm text-gray-200">{part.input?.query || 'Unknown query'}</span>
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
                                  <div className="flex items-center justify-between gap-2 cursor-pointer" onClick={() => setIsOpenGrep(!isOpenGrep)}>
                                    <span className="text-sm font-medium text-zinc-300 flex-1 min-w-0 truncate">Grepping for: {part.input?.query || 'Unknown query'}</span>
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
                                    <div className="text-[14px] leading-relaxed whitespace-pre-wrap break-words text-gray-200 sm:text-[15px] rounded-md bg-zinc-900/50 p-3">
                                      {output}
                                    </div>
                                  </div>
                                </div>
                              );

                            }
                          }

                          if (part.type === "tool-task_agent") {
                            const { toolCallId, state } = part;

                            if (state === "input-streaming") {
                              return (
                                <div
                                  key={toolCallId}
                                  className="text-sm text-zinc-300"
                                >
                                  <span className="mr-2">Task:</span>
                                  <span className="text-zinc-200">
                                    {part.input?.todo_text || "…"}
                                  </span>
                                  <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-zinc-400 animate-pulse" />
                                </div>
                              );
                            }

                            if (state === "input-available") {
                              return (
                                <div
                                  key={toolCallId}
                                  className="text-sm text-zinc-300"
                                >
                                  <span className="mr-2">Task:</span>
                                  <span className="text-zinc-200 whitespace-pre-wrap break-words">
                                    {part.input?.todo_text || "Unknown task"}
                                  </span>
                                </div>
                              );
                            }

                            if (state === "output-available") {
                              const { output } = part;
                              return (
                                <div 
                                  key={toolCallId}
                                  className="space-y-1"
                                >
                                  <div className="text-xs text-zinc-400">Task created</div>
                                  <div className="text-sm text-zinc-200 whitespace-pre-wrap break-words">{output}</div>
                                </div>
                              );
                            }
                          }


                          if (part.type === "tool-string_replace") {
                            const { toolCallId, state } = part;

                            if (state === "input-available") {
                              return (
                                <div
                                  key={toolCallId}
                                  className="overflow-hidden rounded-2xl border border-zinc-700/20 bg-zinc-800/20 backdrop-blur-sm p-4 shadow-lg transition-all duration-200 hover:bg-zinc-800/30 hover:border-zinc-700/30"
                                >
                                  <div className="flex items-center gap-2 mb-3">
                                    <Terminal className="h-4 w-4 text-zinc-400" />
                                    <span className="text-sm font-medium text-zinc-300">
                                      String Replace Input
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-zinc-300 font-mono break-all">
                                      {part.input?.relative_file_path || 'Unknown file'}
                                    </span>
                                  </div>
                                </div>
                              );
                            }
                            if (state === "output-available") {
                              const { output } = part;
                              return (
                                <div
                                  key={toolCallId}
                                  className="overflow-hidden rounded-2xl border border-zinc-700/20 bg-zinc-800/20 backdrop-blur-sm p-4 shadow-lg transition-all duration-200 hover:bg-zinc-800/30 hover:border-zinc-700/30"
                                >
                                  <div className="flex items-center gap-2 mb-3">
                                    <Terminal className="h-4 w-4 text-zinc-400" />
                                    <span className="text-sm font-medium text-zinc-300">
                                      String Replace Output
                                    </span>
                                  </div>
                                  <div className="rounded-xl">
                                    <pre className="text-sm text-zinc-300 font-mono whitespace-pre-wrap break-words overflow-x-auto px-3 py-2">
                                      {output}
                                    </pre>
                                  </div>
                                </div>
                              );
                            }
                          }

                          if (part.type === "tool-run_tsccheck") {

                            const { state, toolCallId } = part;

                            if(state === "input-streaming") {
                              return (
                                <div
                                  key={toolCallId}
                                  className="rounded-lg border border-zinc-700/20 bg-zinc-800/20 p-3"
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <Terminal className="h-4 w-4 text-zinc-400" />
                                    <span className="text-sm text-zinc-300">
                                      TypeScript Check
                                    </span>
                                  </div>
                                  <div className="inline-flex items-center gap-2 rounded-2xl bg-zinc-800/20 px-3 py-2 shadow-lg backdrop-blur-sm ring-1 ring-white/10">
                                    <span className="text-md text-zinc-300 hover:text-white transition-colors duration-200 break-all">
                                      {part.input?.relative_file_path || 'Unknown file'}
                                    </span>
                                  </div>
                                </div>
                              );
                            }

                            if (state === "output-available") {
                              const { output, toolCallId } = part;
                              return (
                                <div
                                  key={toolCallId}
                                  className="rounded-lg border border-zinc-700/20 bg-zinc-800/20 p-3"
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <Terminal className="h-4 w-4 text-zinc-400" />
                                    <span className="text-sm text-zinc-300">
                                      TypeScript Check
                                    </span>
                                  </div>
                                  <div className="rounded bg-zinc-900/50 p-2">
                                    <pre className="text-xs text-zinc-400 font-mono whitespace-pre-wrap break-words">
                                      {output}
                                    </pre>
                                  </div>
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
