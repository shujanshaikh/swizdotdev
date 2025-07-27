import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";

export function useAi({
  id,
  initialMessages,
}: {
  id?: string,
  initialMessages: Array<UIMessage>;
}) {
  const {
    input,
    status,
    handleInputChange,
    handleSubmit,
    messages,
    error,
    reload,
  } = useChat({
    id,
    initialMessages,
    generateId: () => crypto.randomUUID(),
    api: "/api/agent",
    experimental_prepareRequestBody: (body) => ({
      message: body.messages.at(-1),
      id,
    }),
    experimental_throttle: 100,
    sendExtraMessageFields: true,
  });

  return {
    input,
    status,
    handleInputChange,
    handleSubmit,
    messages,
    error,
    reload,
  };
}
