import type { UIMessage } from "ai";
import { CheckCircleIcon, EyeIcon, FileCode2, FolderIcon, LightbulbIcon, SearchIcon, TerminalIcon, TrashIcon } from "lucide-react";

const ToolExecution = ({ toolName, args, result }: {
  toolName: string;
  args?: Record<string, unknown>;
  result?: string;
}) => {
  const getToolDisplay = () => {
    if (toolName === "bash") {
      return (
        <div className="flex items-center gap-3 text-gray-300 bg-zinc-800/50 px-4 py-2.5 rounded-lg">
          <TerminalIcon
            className="w-4 h-4 text-gray-400"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Bash</span>
            <code className="px-2 py-0.5 bg-zinc-700/50 rounded text-blue-400 font-mono text-sm">
              {args?.command as string}
            </code>
          </div>
        </div>
      );
    }

    if (toolName === "ls") {
      const dirPath = args?.relative_dir_path as string || "/";
      const files = result ? result.split('\n')
        .filter(line => line.trim())
        .map(line => line.split(/\s+/).pop() || '')
        .filter(file => file !== '.' && file !== '..') : [];
      return (
        <div className="flex flex-col gap-2 text-gray-300 pb-2 hover:border-zinc-500">
          <div className="flex items-center gap-2">
            <FolderIcon className="w-4 h-4" />
            <h2 className="text-gray-400 font-bold text-md ">Listed directory:</h2>
            <span className="text-blue-400 font-bold">{dirPath}</span>
            <span className="text-gray-400">({files.length} files)</span>
          </div>
          <details className="ml-6">
            <summary className="cursor-pointer hover:text-gray-100">View files</summary>
            <ul className="mt-2 space-y-1">
              {files.map((file, i) => (
                <li key={i} className="flex items-center gap-2">
                  {file.endsWith('/') ? (
                    <FolderIcon className="w-3 h-3" />
                  ) : (
                    <div className="w-3 h-3 border rounded border-gray-500" />
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
      const fileName = args?.relative_file_path as string || "file";
      return (
        <div className="flex items-center gap-2 text-gray-300">
         <EyeIcon
          className="w-4 h-4"
         />
          <span className="text-gray-400">Read file:</span>
          <span className="text-blue-400">{fileName}</span>
        </div>
      );
    }

    if (toolName === "edit_file" && result) {
      const fileName = args?.relative_file_path as string || "file";
      if (result.includes("edited successfully")) {
        return (
          <div className="flex flex-col gap-2 text-gray-300">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-white" />
              <span className="text-gray-400 text-md">Edited file:</span>
              <span className="text-blue-400 text-md">{fileName}</span>
            </div>
            <details className="ml-6 border border-white/20 rounded-3xl p-2">
              <summary className="cursor-pointer hover:text-gray-100">View edit details</summary>
              <div className="mt-2 text-sm text-gray-400">
                {result}
              </div>
            </details>
          </div>
        );
      }
    }

    if (toolName === "run_linter" && result) {
      if (result.includes("No") || result.trim() === "" || result.includes("No linter issues")) {
        return (
          <div className="text-gray-300">
            <CheckCircleIcon
              className="w-4 h-4"
            />
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
              <span className="ml-2">{warnings} linter warning{warnings !== 1 ? 's' : ''}</span>
            </div>
          );
        } else if (errors > 0) {
          return (
            <div className="text-gray-300">
              <span className="text-red-400">⚠</span>
              <span className="ml-2 text-red-400">{errors} runtime error{errors !== 1 ? 's' : ''}</span>
            </div>
          );
        }
      }
    }

    if (toolName === "grep") {
      const query = args?.query as string || "pattern";
      if (result && result.trim() === "") {
        return (
          <div className="text-gray-300">
            <SearchIcon
              className="w-4 h-4"
            />
            <span className="ml-2">No files match</span>
            <span className="text-blue-400 ml-1">&apos;{query}&apos;</span>
          </div>
        );
      } else {
        return (
          <div className="text-gray-300">
            <span className="text-gray-400">🔍</span>
            <span className="ml-2">Search</span>
            <span className="text-blue-400 ml-1">&apos;{query}&apos;</span>
          </div>
        );
      }
    }

    if (toolName === "web_search") {
      const searchTerm = args?.search_term as string || "search";
      return (
        <div className="text-gray-300">
          <span className="text-gray-400">🔍</span>
          <span className="ml-2">Searched images</span>
          <span className="text-blue-400 ml-1">&quot;{searchTerm}&quot;</span>
          <span className="text-gray-400 ml-1">(10)</span>
        </div>
      );
    }

    if (toolName === "delete_file") {
      const fileName = args?.relative_file_path as string || "file";
      return (
        <div className="text-gray-300">
          <TrashIcon
            className="w-4 h-4"
          />
          <span className="ml-2">Deleted</span>
          <span className="text-blue-400 ml-1">{fileName}</span>
        </div>
      );
    }


    if (toolName === "suggestions") {
      const suggestions = args?.suggestions as string[] || [];
      return (
        <div className="text-gray-300">
          <LightbulbIcon
            className="w-4 h-4"
          />
          <span className="ml-2">Suggestions</span>
          <span className="text-blue-400 ml-1">{suggestions.join(", ")}</span>
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

  return (
    <div className="my-4 text-sm">
      {getToolDisplay()}
    </div>
  );
};

export default function ProjectMessageView({
  messages,
  status
}: {
  messages: Array<UIMessage>;
  status: "submitted" | "streaming" | "ready" | "error";
}) {
  return (
    <div className="h-full w-full overflow-y-auto scrollbar-hide">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <div className="text-6xl mb-4 opacity-50">💬</div>
            <div className="text-lg text-gray-400">No messages yet</div>
            <div className="text-sm text-gray-500">Start a conversation to see your chat history!</div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`${message.role === "user" ? "max-w-[75%] ml-auto" : "w-full"}`}>
                  {message.role === "user" ? (
                    <div className="bg-zinc-800 text-white rounded-2xl px-5 py-4">
                      {message.parts.map((part, partIndex) => (
                        <div key={partIndex}>
                          {part.type === "text" && (
                            <div className="whitespace-pre-wrap text-md leading-relaxed">
                              {part.text}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3 w-full py-4">
                      {message.parts.map((part, partIndex) => {
                        if (part.type === "text") {
                          return (
                            <div key={partIndex} className="text-gray-200 text-[15px] leading-relaxed whitespace-pre-wrap ">
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
                          if (state === "result" && "result" in part.toolInvocation) {
                            result = typeof part.toolInvocation.result === "string" 
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

                  {message.experimental_attachments && message.experimental_attachments.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      📎 {message.experimental_attachments.length} file{message.experimental_attachments.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {(status === "submitted") && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 py-4">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"/>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-100"/>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-200"/>
                </div>
              </div>
            )}
            
            {status === "error" && (
              <div className="flex justify-start">
                <div className="w-full">
                  <div className="space-y-3 w-full py-4">
                    <div className="flex items-center gap-2 bg-red-900/20 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"/>
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse delay-100"/>
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse delay-200"/>
                      </div>
                      <span className="text-sm text-red-400">Error occurred</span>
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
