import Image from "next/image";
import { Button } from "./ui/button";
import type { ChatMessage } from "~/lib/types";
import { RefreshCcwIcon } from "lucide-react";

export default function ProjectMessageView({
  messages,
  status,
  error,
  regenerate,
}: {
  messages: ChatMessage[];
  status: "submitted" | "streaming" | "ready" | "error";
  error: undefined | Error;
  regenerate: () => void;
}) {
 
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="scrollbar-hide flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl space-y-6 p-6">
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
                    className={`${message.role === "user" ? "ml-auto max-w-[75%]" : "w-full"}`}
                  >
                    {message.role === "user" ? (
                      <div className="rounded-2xl bg-zinc-800 px-5 py-4 text-white">
                        {message.parts.map((part, partIndex) => (
                          <div key={partIndex}>
                            {part.type === "text" && (
                              <div className="text-md leading-relaxed whitespace-pre-wrap">
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
                              className="mt-4 h-auto w-full max-w-[400px] cursor-pointer rounded-lg shadow-lg transition-opacity hover:opacity-90"
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
                                className="text-[15px] leading-relaxed whitespace-pre-wrap text-gray-200"
                              >
                                {part.text}
                              </div>
                            );


                          }
                          if(part.type === "reasoning" && part.text?.trim().length > 0) {
                            return (
                              <div key={key} className="text-[15px] leading-relaxed whitespace-pre-wrap text-gray-200">
                                {part.text}
                              </div>
                            );
                          }

                          if(part.type === "tool-bash"){
                            const { toolCallId, state } = part;

                            if(state === "input-available"){
                              return (
                                <div key={toolCallId} className="text-[15px] leading-relaxed whitespace-pre-wrap text-gray-200">
                                  {part.input.command}
                                </div>
                              )
                            }

                            if (state === 'output-available') {
                              const { output } = part;
                              return (
                                <div key={toolCallId}>
                                  {output}
                                </div>
                              );
                            }
                          }
                          if(part.type === "tool-webScraper"){
                            const { toolCallId, state } = part;

                            if(state === "input-available"){
                              return (
                                <div key={toolCallId} className="text-[15px] leading-relaxed whitespace-pre-wrap text-gray-200">
                                  {part.input.url}
                                </div>
                              )
                            }

                            if(state === "output-available"){
                              const { output } = part;
                              return (
                                <div key={toolCallId}>
                                  {output.url && (
                                    <div className="text-[15px] leading-relaxed whitespace-pre-wrap text-gray-200">
                                      {output.url}
                                    </div>
                                  )}
                                  {output.error && (
                                    <div className="text-[15px] leading-relaxed whitespace-pre-wrap text-red-500">
                                      {output.error}
                                    </div>
                                  )}
                                </div>
                              );
                            }
                          }

                          if(part.type === "tool-ls"){
                            const { toolCallId, state } = part;

                            if(state === "input-available"){
                              return (
                                <div key={toolCallId} className="text-[15px] leading-relaxed whitespace-pre-wrap text-gray-200">
                                 Tool: ls {part.input.relative_dir_path}
                                </div>
                              )
                              }
                          }

                          if(part.type === "tool-glob"){
                            const { toolCallId, state } = part;

                            if(state === "input-available"){
                              return (
                                <div key={toolCallId} className="text-[15px] leading-relaxed whitespace-pre-wrap text-gray-200">
                                  {part.input.pattern}
                                </div>
                              )
                            }

                            if(state === "output-available"){
                              const { output } = part;
                              return (
                                <div key={toolCallId}>
                                  {output}
                                </div>
                              );
                            }
                          }

                          if(part.type === "tool-edit_file"){
                            const { toolCallId, state } = part;

                            if(state === "input-available"){
                              return (
                                <div key={toolCallId} className="text-[15px] leading-relaxed whitespace-pre-wrap text-gray-200">
                                  {part.input.code_edit}
                                </div>
                              )
                            }


                            if(state === "output-available"){
                              const { output } = part;
                              return (
                                <div key={toolCallId}>
                                  {output}
                                </div>
                            );
                          }
                        }
                          

                          if(part.type === "tool-grep"){
                            const { toolCallId, state } = part;

                            if(state === "input-available"){
                              return (
                                <div key={toolCallId} className="text-[15px] leading-relaxed whitespace-pre-wrap text-gray-200">
                                  {part.input.query}
                                </div>
                              )
                            }

                            if(state === "output-available"){
                              const { output } = part;
                              return (
                                <div key={toolCallId}>
                                  {output}
                                </div>
                              );
                            }
                          }

                          if(part.type === "tool-task_agent"){
                            const { toolCallId, state } = part;

                            if(state === "input-available"){
                              return (
                                <div key={toolCallId} className="text-[15px] leading-relaxed whitespace-pre-wrap text-gray-200">
                                  {part.input.prompt}
                                </div>
                              )
                            }

                            if(state === "output-available"){
                              const { output } = part;
                              return (
                                <div key={toolCallId}>
                                  {output}
                                </div>
                              );
                            }
                          } 

                          if(part.type === "tool-webSearch"){ 
                            const { toolCallId, state } = part;

                            if(state === "input-available"){
                              return (
                                <div key={toolCallId} className="text-[15px] leading-relaxed whitespace-pre-wrap text-gray-200">
                                  {part.input.search_term}
                                </div>
                              )
                            }

                            if(state === "output-available"){
                              const { output } = part;
                              return (
                                <div key={toolCallId}>
                                  {output?.map((result) => (
                                    <div key={result.url}>
                                      <a href={result.url} target="_blank" rel="noopener noreferrer">
                                        {result.title}
                                      </a>
                                    </div>
                                  ))}
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

              {status === "error" && (
                <div className="flex justify-start">
                  <div className="w-full">
                    <div className="w-full space-y-3 py-4">
                      <div className="flex items-center gap-2 rounded-lg bg-red-900/20 px-4 py-3">
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
                          <div className="h-2 w-2 animate-pulse rounded-full bg-red-400 delay-100" />
                          <div className="h-2 w-2 animate-pulse rounded-full bg-red-400 delay-200" />
                        </div>
                        <span className="text-sm text-red-400">
                          {error?.message ||
                            (typeof error === "string"
                              ? error
                              : error
                                ? JSON.stringify(error, null, 2)
                                : "Unknown error")}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={regenerate}
                          className="flex items-center gap-2"
                        >
                          <RefreshCcwIcon className="h-4 w-4" />
                          <span className="text-sm">Reload</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
