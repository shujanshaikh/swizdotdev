import type { UIMessage } from "ai";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  EyeIcon,
  FileCode2,
  FolderIcon,
  Globe,
  Brain,
  SearchIcon,
  TerminalIcon,
  TrashIcon,
  RefreshCcwIcon,
} from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";

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

    if(toolName === "string_replace") {
      return (
        <div className="flex flex-col gap-2 text-gray-300 hover:border-zinc-500 rounded-lg p-3 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <FileCode2 className="h-4 w-4 text-gray-400" />
            <h2 className="text-md font-medium text-gray-400">String replace:</h2>
            <span className="font-bold text-blue-400">{args?.relative_file_path as string}</span>
            <span className="text-gray-400">({args?.old_string as string} -&gt; {args?.new_string as string})</span>
          </div>
          <details className="ml-6">
            <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-100">
              View file contents
            </summary>
            <div className="mt-2 rounded border border-zinc-700/50 bg-zinc-800/30 p-3">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap">{result}</pre>
            </div>
          </details>
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
        <div className="flex flex-col gap-2 text-gray-300 hover:border-zinc-500 rounded-lg p-3 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <EyeIcon className="h-4 w-4 text-gray-400" />
            <h2 className="text-md font-medium text-gray-400">Read file:</h2>
            <span className="font-bold text-blue-400">{fileName}</span>
          </div>
          <details className="ml-6">
            <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-100">
              View file contents
            </summary>
            <div className="mt-2 rounded border border-zinc-700/50 bg-zinc-800/30 p-3">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap">{result}</pre>
            </div>
          </details>
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
              <span className="text-md text-gray-400">{fileName}</span>
              {result.includes("creating") && (
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-gray-400" />
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-gray-400 delay-100" />
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-gray-400 delay-200" />
                </div>
              )}
            </div>
            <div className="ml-6 rounded-lg border border-gray-500/20 bg-gray-500/5 p-3">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">File edited successfully</span>
              </div>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-100">
                  View edit details
                </summary>
                <div className="mt-2 rounded bg-zinc-800/50 p-2 text-sm text-gray-400">
                  {result}
                </div>
              </details>
            </div>
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
      return (
        <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10">
                <Globe className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-200">
                  Web Search
                </span>
              </div>
            </div>
            {!result && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400/30 border-t-blue-400" />
            )}
          </div>
          {result && (
            <details className="group mt-3">
              <summary className="flex cursor-pointer items-center gap-2 text-sm text-gray-400 hover:text-gray-300">
                <span>View search results</span>
                <ChevronDownIcon className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-3 rounded-lg border border-zinc-600/50 bg-zinc-800/50">
                <div className="space-y-3 p-4">
                  {JSON.parse(result).map(
                    (
                      item: { url: string; title: string; content: string },
                      i: number,
                    ) => (
                      <div
                        key={i}
                        className="rounded-md border border-zinc-600/30 bg-zinc-700/30 p-3 transition-colors hover:bg-zinc-700/50"
                      >
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="line-clamp-2 block text-sm font-medium text-blue-400 hover:text-blue-300"
                          title={item.title}
                        >
                          {item.title}
                        </a>
                        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-gray-400">
                          {item.content}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </details>
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

    if (toolName === "web_scrape") {
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

      return (
        <div className="rounded-xl border border-white/20 bg-zinc-800/30 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-200">
                  Web Scraping
                </span>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span
                    className="max-w-[200px] truncate text-blue-400"
                    title={url}
                  >
                    {url}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span>{theme}</span>
                  <span className="text-gray-500">•</span>
                  <span>{viewport}</span>
                </div>
              </div>
            </div>
            {!result && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400/30 border-t-blue-400" />
            )}
          </div>

          {include_screenshot && screenshotData && (
            <div className="mt-4 rounded-lg border border-white/10 bg-zinc-900/30 p-3">
              <div className="mb-2 text-xs font-medium tracking-wider text-gray-400 uppercase">
                Screenshot Preview
              </div>
              <div className="overflow-hidden rounded-lg border border-white/10">
                <Image
                  src={
                    screenshotData.startsWith("data:")
                      ? screenshotData
                      : `data:image/png;base64,${screenshotData}`
                  }
                  alt="Web scraping screenshot"
                  width={400}
                  height={400}
                  className="h-auto w-full cursor-pointer transition-transform hover:scale-[1.02]"
                  onClick={() => {
                    const newWindow = window.open();
                    if (newWindow) {
                      newWindow.document.write(
                        `<img src="${screenshotData.startsWith("data:") ? screenshotData : `data:image/png;base64,${screenshotData}`}" style="max-width: 100%; height: auto;" />`,
                      );
                    }
                  }}
                />
              </div>
            </div>
          )}

          {include_screenshot && !screenshotData && result && (
            <div className="mt-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-3 py-2">
              <div className="flex items-center gap-2 text-sm text-yellow-400">
                <span>⚠</span>
                <span>Screenshot was requested but not available</span>
              </div>
            </div>
          )}
        </div>
      );
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
  error,
  reload,
}: {
  messages: Array<UIMessage>;
  status: "submitted" | "streaming" | "ready" | "error";
  error: undefined | Error;
  reload: () => void;
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
                            className="mt-4 h-auto w-full max-w-[400px] cursor-pointer rounded-lg shadow-lg transition-opacity hover:opacity-90"
                            onClick={() =>
                              window.open(attachment.url, "_blank")
                            }
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
                        {error?.message}
                      </span>
                      <Button variant="outline" size="sm" onClick={reload} className="flex items-center gap-2">
                         <RefreshCcwIcon className="w-4 h-4" />
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
  );
}
