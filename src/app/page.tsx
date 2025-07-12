"use client";

import { useChat } from "@ai-sdk/react";
import Link from "next/link";

type MessagePart =
  | { type: 'text'; text: string }
  | {
      type: 'tool-invocation';
      toolInvocation: {
        state: 'partial-call' | 'call' | 'result';
        toolCallId: string;
        toolName: string;
        args?: Record<string, unknown>;
        result?: unknown;
      };
    };

export default function Chat() {
  const {
    input,
    status,
    handleInputChange,
    handleSubmit,
    messages,
  } = useChat({
    api: "/api/agent",
    sendExtraMessageFields: true,
    maxSteps: 3,
  });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <div className="">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          Back
        </Link>
      </div>
      <div className="space-y-8">
        {messages.map((m) => (
          <div key={m.id} className="whitespace-pre-wrap">
            <span className="font-semibold text-sm">
              {m.role === "user" ? "User: " : "AI: "}
            </span>
            <div className="space-y-4">
              {/* Iterate over message parts to support streaming tool calls/results */}
              {(m.parts as MessagePart[] | undefined)?.map((part, i) => {
                if (part.type === 'text') {
                  return (
                    <div key={m.id + "-part-" + i} className="prose">
                      <div className="whitespace-pre-wrap">{part.text}</div>
                    </div>
                  );
                }

                if (part.type === 'tool-invocation') {
                  const { toolInvocation } = part;

                  return (
                    <details
                      key={`tool-${toolInvocation.toolCallId}`}
                      className="relative p-2 rounded-lg bg-zinc-100 group"
                    >
                      <summary className="list-none cursor-pointer select-none flex justify-between items-center pr-2">
                        <span className="inline-flex items-center px-1 py-0.5 text-xs font-medium rounded-md font-mono text-zinc-900">
                          {toolInvocation.toolName}
                        </span>
                        {toolInvocation.state === 'partial-call' && (
                          <span className="text-xs text-zinc-400 animate-pulse">
                            Building call...
                          </span>
                        )}
                        {toolInvocation.state === 'call' && (
                          <span className="text-xs text-zinc-400 animate-pulse">
                            calling...
                          </span>
                        )}
                        {toolInvocation.state === 'result' && (
                          <span className="text-xs text-zinc-500 ml-2">
                            Click to expand
                          </span>
                        )}
                      </summary>
                      
                      {toolInvocation.state === 'call' && toolInvocation.args && (
                        <div className="mt-4 bg-zinc-50 p-2">
                          <div className="text-xs text-blue-600 mb-2">Arguments:</div>
                          <pre className="font-mono text-xs">
                            {JSON.stringify(toolInvocation.args, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      {toolInvocation.state === 'result' && (
                        <div className="mt-4 bg-zinc-50 p-2">
                          <div className="text-xs text-green-700 mb-2">Result:</div>
                          <pre className="font-mono text-xs">
                            {JSON.stringify(toolInvocation.result, null, 2)}
                          </pre>
                        </div>
                      )}
                    </details>
                  );
                }

                return null;
              })}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
          disabled={status !== "ready"}
        />
      </form>
    </div>
  );
}