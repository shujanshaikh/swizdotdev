import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  smoothStream,
  stepCountIs,
  streamText,
} from "ai";
import { Sandbox } from "@e2b/code-interpreter";
import { PROMPT } from "~/lib/prompt";
import { convertToUIMessages } from "~/lib/utils";
import { getSandbox } from "~/lib/sandbox";
import {
  getMessagesByProjectId,
  getProjectById,
  saveMessages,
  saveProject,
} from "~/server/db/queries";
import { generateTitleFromUserMessage } from "~/lib/generate-title";
import type { ChatMessage } from "~/lib/types";
import { edit_file } from "~/lib/ai/tools/edit-files";
import { bash } from "~/lib/ai/tools/bash";
import { web_search } from "~/lib/ai/tools/web-search";
import { glob } from "~/lib/ai/tools/glob";
import { suggestions } from "~/lib/ai/tools/suggestion";
import { ls } from "~/lib/ai/tools/ls";
import { webscraper } from "~/lib/ai/tools/web-scrape";
import { grep } from "~/lib/ai/tools/grep";
import { read_file } from "~/lib/ai/tools/read-files";
import { delete_file } from "~/lib/ai/tools/delete-files";
import { getSession } from "~/lib/server";
import { NextResponse } from "next/server";
import { string_replace } from "~/lib/ai/tools/string-replace";
import { checkPremiumUser } from "~/lib/check-premium";
import { run_tsccheck } from "~/lib/ai/tools/run-tsccheck";
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

export async function POST(req: Request) {
  const {
    message,
    id,
    model,
  }: { message: ChatMessage; id: string; model: string } = await req.json();

  const session = await getSession();
  const userId = session?.user.id;

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { shouldThrowMessageError } = await checkPremiumUser(
    userId,
    "messages",
  );
  if (shouldThrowMessageError) {
    return NextResponse.json(
      {
        error: "UPGRADE_REQUIRED",
        message: "You've reached the plan limit.",
      },
      { status: 402 },
    );
  }

  const project = await getProjectById({ id });

  let sandboxId = "";
  if (!project) {
    const title = await generateTitleFromUserMessage({
      message,
    });

    const sandbox = await Sandbox.betaCreate("swizsandbox", {
      requestTimeoutMs: 900_000,
      timeoutMs: 900_000,
      autoPause: true,
    });
    sandboxId = sandbox.sandboxId;

    await saveProject({
      id: id,
      title,
      sandboxId,
      sandboxUrl: `https://${sandbox.getHost(3000)}`,
      userId,
    });
  } else {
    sandboxId = project.sandboxId!;
    await getSandbox(sandboxId);
  }
  await saveMessages({
    messages: [
      {
        projectId: id,
        id: message.id,
        role: "user",
        parts: message.parts,
        attachments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        model: model,
      },
    ],
  });

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });
  const models = openrouter.chat(model);

  const messagesFromDb = await getMessagesByProjectId({ id });
  const uiMessages = [...convertToUIMessages(messagesFromDb), message];

  return createUIMessageStreamResponse({
    stream: createUIMessageStream({
      execute: ({ writer: dataStream }) => {
        const result = streamText({
          messages: convertToModelMessages(uiMessages),
          model: models,
          system: PROMPT,
          temperature: 0.7,
          stopWhen: stepCountIs(20),
          experimental_transform: smoothStream({
            delayInMs: 10,
            chunking: "line",
          }),
          maxRetries: 3,
          tools: {
            edit_file: edit_file({ sandboxId }),
           // grep: grep({ sandboxId }),
            ls: ls({ sandboxId }),
            glob: glob({ sandboxId }),
            bash: bash({ sandboxId }),
            webScraper: webscraper,
            webSearch: web_search,
            suggestion: suggestions,
            read_file: read_file({ sandboxId }),
            delete_file: delete_file({ sandboxId }),
            string_replace: string_replace({ sandboxId }),
          
          },

        });
        result.consumeStream();
        dataStream.merge(
          result.toUIMessageStream({
            sendReasoning: true,
          }),
        );
      },
      onFinish: async ({ messages }) => {
        await saveMessages({
          messages: messages.map((message) => ({
            id: crypto.randomUUID(),
            role: message.role,
            parts: message.parts,
            createdAt: new Date(),
            attachments: [],
            projectId: id,
            model: model,
            updatedAt: new Date(),
          })),
        });
      },
      onError: (error) => {
        console.error(`Error : ${error}`)
        return error instanceof Error ? error.message : String(error)
      },
    }),

  });
}
