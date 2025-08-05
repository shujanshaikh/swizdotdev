import { Sandbox } from "@e2b/code-interpreter";
import type { CoreAssistantMessage, CoreToolMessage } from "ai";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function getSandbox(sandboxId: string) {
  const sandbox = await Sandbox.connect(sandboxId , {
      requestTimeoutMs: 1200000, // 20 minutes
  });
  return sandbox;
}

type ResponseMessageWithoutId = CoreToolMessage | CoreAssistantMessage;
type ResponseMessage = ResponseMessageWithoutId & { id: string };

export function getTrailingMessageId({
  messages,
}: {
  messages: Array<ResponseMessage>;
}): string | null {
  const trailingMessage = messages.at(-1);

  if (!trailingMessage) return null;

  return trailingMessage.id;
}