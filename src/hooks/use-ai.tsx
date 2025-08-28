"use client"
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type FileUIPart } from "ai";
import { useState } from "react";
import { models } from '~/lib/model/model';
import type { ChatMessage } from "~/lib/types";

export function useAi({
  id,
  initialMessages,
}: {
  id?: string;
  initialMessages: ChatMessage[];
}) {
  const {
    status,
    messages,
    sendMessage,
    error,
    regenerate,
    setMessages,
    stop
  } = useChat<ChatMessage>({
    id,
    messages: initialMessages,
    generateId: () => crypto.randomUUID(),
    transport: new DefaultChatTransport({
      api: '/api/agent',
      prepareSendMessagesRequest({ messages, id, body }) {
        return {
          body: {
            id,
            message: messages.at(-1),
            ...body,
          },
        };
      },
      
    }),
    onData: (event) => {
      console.log(event);
    },
    experimental_throttle: 100,
  });

  const [files , setFiles] = useState<FileUIPart[]>([]);

  const [input, setInput] = useState("");
  const [model, setModel] = useState<string>(models?.[0]?.value ?? "");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || status === "streaming") return;
    sendMessage({ text: input , files} , {
      body : {
        model : model
      }
    }) ;
    setInput('');
    setFiles([]);
  };
  return {
    stop,
    status,
    messages,
    error,
    regenerate,
    input,
    setInput,
    handleSubmit,
    sendMessage,
    setMessages,
    files,
    setFiles,
    model,
    setModel,
  };
}
