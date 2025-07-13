"use client";

import { useChat } from "@ai-sdk/react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { ArrowUp } from "lucide-react";

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-black to-white/5 p-4 select-none">
      <div className="w-full max-w-5xl text-center">
        <h1 className="mb-6 text-6xl font-bold text-white select-none md:text-7xl">
          Make anything
        </h1>
        <p className="mb-12 text-xl text-gray-400 select-none">
          Build fullstack web apps by prompting
        </p>
        <div className="relative mx-auto max-w-4xl select-none">
          <div className="mb-8 h-auto space-y-6 pr-2 custom-scrollbar bg-black/40 rounded-3xl p-10">
            {messages.length === 0 && (
              <div className="text-gray-500 text-lg mt-24">Start the conversation…</div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] px-8 py-6 rounded-3xl text-lg shadow-lg whitespace-pre-wrap
                    ${m.role === "user"
                      ? "bg-white text-black rounded-br-2xl"
                      : "bg-zinc-900 text-white rounded-bl-2xl"}
                  `}
                >
                  <span className="block font-semibold text-xs mb-2 opacity-40">
                    {m.role === "user" ? "You" : "AI"}
                  </span>
                  <div className="space-y-3">
                    {(m.parts as MessagePart[] | undefined)?.map((part, i) => {
                      if (part.type === 'text') {
                        return (
                          <div key={m.id + "-part-" + i}>{part.text}</div>
                        );
                      }
                      if (part.type === 'tool-invocation') {
                        const { toolInvocation } = part;
                        return (
                          <details
                            key={`tool-${toolInvocation.toolCallId}`}
                            className="relative p-2 rounded-xl bg-zinc-800 mt-2"
                          >
                            <summary className="list-none cursor-pointer select-none flex justify-between items-center pr-2">
                              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md font-mono text-white bg-zinc-700">
                                {toolInvocation.toolName}
                              </span>
                              {toolInvocation.state === 'partial-call' && (
                                <span className="text-xs text-gray-400 animate-pulse ml-2">
                                  Building call…
                                </span>
                              )}
                              {toolInvocation.state === 'call' && (
                                <span className="text-xs text-gray-300 animate-pulse ml-2">
                                  Calling…
                                </span>
                              )}
                              {toolInvocation.state === 'result' && (
                                <span className="text-xs text-gray-400 ml-2">
                                  Click to expand
                                </span>
                              )}
                            </summary>
                            {toolInvocation.state === 'call' && toolInvocation.args && (
                              <div className="mt-3 bg-zinc-900 p-2 rounded">
                                <div className="text-xs text-gray-300 mb-1 font-semibold">Arguments:</div>
                                <pre className="font-mono text-xs text-white">
                                  {JSON.stringify(toolInvocation.args, null, 2)}
                                </pre>
                              </div>
                            )}
                            {toolInvocation.state === 'result' && (
                              <div className="mt-3 bg-zinc-900 p-2 rounded">
                                <div className="text-xs text-gray-300 mb-1 font-semibold">Result:</div>
                                <pre className="font-mono text-xs text-white">
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
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="relative">
            <Input
              disabled={status !== "ready"}
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message…"
              className="h-24 w-full rounded-2xl bg-zinc-900 px-6 py-10 pr-20 text-lg text-white placeholder:text-gray-400 border-none shadow-xl"
              autoFocus
            />
            <Button
              disabled={status !== "ready" || !input.trim()}
              type="submit"
              className="absolute bottom-6 right-6 h-12 w-12 rounded-full bg-white text-black hover:bg-zinc-200 flex items-center justify-center p-0 shadow-lg transition disabled:opacity-50"
            >
              <ArrowUp className="h-6 w-6" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}