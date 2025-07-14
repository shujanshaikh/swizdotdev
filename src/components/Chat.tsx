"use client";

import { useChat } from "@ai-sdk/react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { ArrowUp } from "lucide-react";
import type { UIMessage } from "ai";

type MessagePart =
  | { type: "text"; text: string }
  | {
      type: "tool-invocation";
      toolInvocation: {
        state: "partial-call" | "call" | "result";
        toolCallId: string;
        toolName: string;
        args?: Record<string, unknown>;
        result?: unknown;
      };
    };

export default function Chat({
  id,
  initialMessages,
}: {
  id: string,
  initialMessages: Array<UIMessage>;
}) {
  const { input, status, handleInputChange, handleSubmit, messages } = useChat({
    id,
    initialMessages,
    generateId : () => crypto.randomUUID(),
    api: "/api/agent",
    experimental_prepareRequestBody: (body) => ({
      message: body.messages.at(-1),
      id,
    }),
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
          <div className="custom-scrollbar mb-8 h-auto space-y-6 rounded-3xl bg-black/40 p-10 pr-2">
            {messages.length === 0 && (
              <div className="mt-24 text-lg text-gray-500">
                Start the conversation…
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-3xl px-8 py-6 text-lg whitespace-pre-wrap shadow-lg ${
                    m.role === "user"
                      ? "rounded-br-2xl bg-white text-black"
                      : "rounded-bl-2xl bg-zinc-900 text-white"
                  } `}
                >
                  <span className="mb-2 block text-xs font-semibold opacity-40">
                    {m.role === "user" ? "You" : "AI"}
                  </span>
                  <div className="space-y-3">
                    {(m.parts as MessagePart[] | undefined)?.map((part, i) => {
                      if (part.type === "text") {
                        return <div key={m.id + "-part-" + i}>{part.text}</div>;
                      }
                      if (part.type === "tool-invocation") {
                        const { toolInvocation } = part;
                        return (
                          <details
                            key={`tool-${toolInvocation.toolCallId}`}
                            className="relative mt-2 rounded-xl bg-zinc-800 p-2"
                          >
                            <summary className="flex cursor-pointer list-none items-center justify-between pr-2 select-none">
                              <span className="inline-flex items-center rounded-md bg-zinc-700 px-2 py-0.5 font-mono text-xs font-medium text-white">
                                {toolInvocation.toolName}
                              </span>
                              {toolInvocation.state === "partial-call" && (
                                <span className="ml-2 animate-pulse text-xs text-gray-400">
                                  Building call…
                                </span>
                              )}
                              {toolInvocation.state === "call" && (
                                <span className="ml-2 animate-pulse text-xs text-gray-300">
                                  Calling…
                                </span>
                              )}
                              {toolInvocation.state === "result" && (
                                <span className="ml-2 text-xs text-gray-400">
                                  Click to expand
                                </span>
                              )}
                            </summary>
                            {toolInvocation.state === "call" &&
                              toolInvocation.args && (
                                <div className="mt-3 rounded bg-zinc-900 p-2">
                                  <div className="mb-1 text-xs font-semibold text-gray-300">
                                    Arguments:
                                  </div>
                                  <pre className="font-mono text-xs text-white">
                                    {JSON.stringify(
                                      toolInvocation.args,
                                      null,
                                      2,
                                    )}
                                  </pre>
                                </div>
                              )}
                            {toolInvocation.state === "result" && (
                              <div className="mt-3 rounded bg-zinc-900 p-2">
                                <div className="mb-1 text-xs font-semibold text-gray-300">
                                  Result:
                                </div>
                                <pre className="font-mono text-xs text-white">
                                  {JSON.stringify(
                                    toolInvocation.result,
                                    null,
                                    2,
                                  )}
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
              className="h-24 w-full rounded-2xl border-none bg-zinc-900 px-6 py-10 pr-20 text-lg text-white shadow-xl placeholder:text-gray-400"
              autoFocus
            />
            <Button
              disabled={status !== "ready" || !input.trim()}
              type="submit"
              className="absolute right-6 bottom-6 flex h-12 w-12 items-center justify-center rounded-full bg-white p-0 text-black shadow-lg transition hover:bg-zinc-200 disabled:opacity-50"
            >
              <ArrowUp className="h-6 w-6" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
