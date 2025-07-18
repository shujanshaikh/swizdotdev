import type { UIMessage } from "ai";
import {
  CheckCircleIcon,
  EyeIcon,
  FileCode2,
  FolderIcon,
  Globe,
  SearchIcon,
  TerminalIcon,
  TrashIcon,
} from "lucide-react";
import Image from "next/image";

const ToolExecution = ({
  toolName,
  args,
  result,
}: {
  toolName: string;
  args?: Record<string, unknown>;
  result?: string;
}) => {
  const getToolDisplay = () => {
    if (toolName === "bash") {
      return (
        <div className="flex items-center gap-3 rounded-lg bg-zinc-800/50 px-4 py-2.5 text-gray-300">
          <TerminalIcon className="h-4 w-4 text-gray-400" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Bash</span>
            <code className="rounded bg-zinc-700/50 px-2 py-0.5 font-mono text-sm text-blue-400">
              {args?.command as string}
            </code>
          </div>
        </div>
      );
    }

    if (toolName === "ls") {
      const dirPath = (args?.relative_dir_path as string) || "/";
      const files = result
        ? result
            .split("\n")
            .filter((line) => line.trim())
            .map((line) => line.split(/\s+/).pop() || "")
            .filter((file) => file !== "." && file !== "..")
        : [];
      return (
        <div className="flex flex-col gap-2 pb-2 text-gray-300 hover:border-zinc-500">
          <div className="flex items-center gap-2">
            <FolderIcon className="h-4 w-4" />
            <h2 className="text-md font-bold text-gray-400">
              Listed directory:
            </h2>
            <span className="font-bold text-blue-400">{dirPath}</span>
            <span className="text-gray-400">({files.length} files)</span>
          </div>
          <details className="ml-6">
            <summary className="cursor-pointer hover:text-gray-100">
              View files
            </summary>
            <ul className="mt-2 space-y-1">
              {files.map((file, i) => (
                <li key={i} className="flex items-center gap-2">
                  {file.endsWith("/") ? (
                    <FolderIcon className="h-3 w-3" />
                  ) : (
                    <div className="h-3 w-3 rounded border border-gray-500" />
                  )}
                  <span className="text-sm">{file}</span>
                </li>
              ))}
            </ul>
          </details>
        </div>
      );
    }

    if (toolName === "read_file") {
      const fileName = (args?.relative_file_path as string) || "file";
      return (
        <div className="flex items-center gap-2 text-gray-300">
          <EyeIcon className="h-4 w-4" />
          <span className="text-gray-400">Read file:</span>
          <span className="text-blue-400">{fileName}</span>
        </div>
      );
    }

    if (toolName === "edit_file" && result) {
      const fileName = (args?.relative_file_path as string) || "file";
      if (result.includes("edited successfully")) {
        return (
          <div className="flex flex-col gap-2 text-gray-300">
            <div className="flex items-center gap-2">
              <FileCode2 className="h-4 w-4 text-white" />
              <span className="text-md text-gray-400">Edited file:</span>
              <span className="text-md text-blue-400">{fileName}</span>
            </div>
            <details className="ml-6 rounded-3xl border border-white/20 p-2">
              <summary className="cursor-pointer hover:text-gray-100">
                View edit details
              </summary>
              <div className="mt-2 text-sm text-gray-400">{result}</div>
            </details>
          </div>
        );
      }
    }

    if (toolName === "run_linter" && result) {
      if (
        result.includes("No") ||
        result.trim() === "" ||
        result.includes("No linter issues")
      ) {
        return (
          <div className="text-gray-300">
            <CheckCircleIcon className="h-4 w-4" />
            <span className="ml-2">No linter issues</span>
          </div>
        );
      } else {
        const warnings = (result.match(/warning/gi) || []).length;
        const errors = (result.match(/error/gi) || []).length;

        if (warnings > 0 && errors === 0) {
          return (
            <div className="text-gray-300">
              <span className="text-yellow-400">⚠</span>
              <span className="ml-2">
                {warnings} linter warning{warnings !== 1 ? "s" : ""}
              </span>
            </div>
          );
        } else if (errors > 0) {
          return (
            <div className="text-gray-300">
              <span className="text-red-400">⚠</span>
              <span className="ml-2 text-red-400">
                {errors} runtime error{errors !== 1 ? "s" : ""}
              </span>
            </div>
          );
        }
      }
    }

    if (toolName === "grep") {
      const query = (args?.query as string) || "pattern";
      if (result && result.trim() === "") {
        return (
          <div className="text-gray-300">
            <SearchIcon className="h-4 w-4" />
            <span className="ml-2">No files match</span>
            <span className="ml-1 text-blue-400">&apos;{query}&apos;</span>
          </div>
        );
      } else {
        return (
          <div className="text-gray-300">
            <span className="text-gray-400">🔍</span>
            <span className="ml-2">Search</span>
            <span className="ml-1 text-blue-400">&apos;{query}&apos;</span>
          </div>
        );
      }
    }

    if (toolName === "web_search") {
      const searchTerm = (args?.search_term as string) || "search";
      return (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center">
            <span>Web search &quot;{searchTerm}&quot;</span>
          </div>
          {result && (
            <div className="space-y-3 pl-6">
              {JSON.parse(result).map(
                (
                  item: { url: string; title: string; content: string },
                  i: number,
                ) => (
                  <div key={i}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {item.title}
                    </a>
                    <p className="mt-1 text-sm">{item.content}</p>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      );
    }

    if (toolName === "delete_file") {
      const fileName = (args?.relative_file_path as string) || "file";
      return (
        <div className="text-gray-300">
          <TrashIcon className="h-4 w-4" />
          <span className="ml-2">Deleted</span>
          <span className="ml-1 text-blue-400">{fileName}</span>
        </div>
      );
    }

    if (toolName === "suggestions") {
      const suggestions = (args?.suggestions as string[]) || [];
      return (
        <div className="text-white">
          <span className="text-lg font-medium">Suggested next steps:</span>
          <div className="mt-2 ml-4 text-gray-200">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="mb-2">
                {index + 1}. {suggestion}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if(toolName === "web_scrape"){
      const url = (args?.url as string) || "url";
      const theme = (args?.theme as string) || "theme";
      const viewport = (args?.viewport as string) || "viewport";
      const include_screenshot = args?.include_screenshot as boolean;

      // Parse the result to get the screenshot data
      let screenshotData = null;
      if (result) {
        try {
          const parsedResult = JSON.parse(result);
          if (parsedResult.success && parsedResult.screenshot) {
            screenshotData = parsedResult.screenshot;
          }
        } catch (e) {
          console.error("Failed to parse web_scrape result:", e);
        }
      }
      

      return <div className="flex flex-col gap-2 text-gray-300">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span className="ml-2">Web scraping</span>
          <span className="ml-1 text-blue-400">{url}</span>
          <span className="ml-1 text-gray-500">({theme}, {viewport})</span>
        </div>
        {include_screenshot && screenshotData && (
          <div className="mt-2 ml-6">
            <Image 
              src={screenshotData.startsWith('data:') ? screenshotData : `data:image/png;base64,${screenshotData}`}
              alt="Web scraping screenshot" 
              width={400} 
              height={400} 
              className="rounded-lg border border-gray-600 shadow-lg max-w-full h-auto"
            />
          </div>
        )}
        {include_screenshot && !screenshotData && result && (
          <div className="mt-2 ml-6 text-gray-500 text-sm">
            Screenshot was requested but not available in the result
          </div>
        )}
      </div>;
    }

    return (
      <div className="text-gray-300">
        <span className="text-gray-400">⚙</span>
        <span className="ml-2">{toolName}</span>
      </div>
    );
  };

  return <div className="my-4 text-sm">{getToolDisplay()}</div>;
};

export default function ProjectMessageView({
  messages,
  status,
}: {
  messages: Array<UIMessage>;
  status: "submitted" | "streaming" | "ready" | "error";
}) {
  return (
    <div className="scrollbar-hide h-full w-full overflow-y-auto">
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        {messages.length === 0 ? (
          <div className="flex h-96 flex-col items-center justify-center text-center">
            <div className="mb-4 text-6xl opacity-50">💬</div>
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
                      {message.experimental_attachments
                        ?.filter((attachment) =>
                          attachment.contentType?.startsWith("image/"),
                        )
                        .map((attachment, index) => (
                          <Image
                            key={`${message.id}-${index}`}
                            src={attachment.url}
                            alt={attachment.name || "Image attachment"}
                            width={400}
                            height={400}
                            className="mt-4 w-full max-w-[400px] h-auto rounded-lg shadow-lg hover:opacity-90 transition-opacity cursor-pointer"
                            onClick={() => window.open(attachment.url, '_blank')}
                            priority
                          />
                        ))}
                    </div>
                  ) : (
                    <div className="w-full space-y-3 py-4">
                      {message.parts.map((part, partIndex) => {
                        if (part.type === "text") {
                          return (
                            <div
                              key={partIndex}
                              className="text-[15px] leading-relaxed whitespace-pre-wrap text-gray-200"
                            >
                              {part.text}
                            </div>
                          );
                        }

                        if (part.type === "tool-invocation") {
                          const callId = part.toolInvocation.toolCallId;
                          const toolName = part.toolInvocation.toolName;
                          const state = part.toolInvocation.state;
                          const args = part.toolInvocation.args;

                          let result: string | undefined;
                          if (
                            state === "result" &&
                            "result" in part.toolInvocation
                          ) {
                            result =
                              typeof part.toolInvocation.result === "string"
                                ? part.toolInvocation.result
                                : JSON.stringify(part.toolInvocation.result);
                          }

                          return (
                            <ToolExecution
                              key={callId}
                              toolName={toolName}
                              args={args}
                              result={result}
                            />
                          );
                        }

                        return null;
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
                        Error occurred
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
