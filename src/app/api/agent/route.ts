import {
  convertToModelMessages,
  smoothStream,
  stepCountIs,
  streamText,
} from "ai";
import { Sandbox } from "@e2b/code-interpreter";
import { PROMPT } from "~/lib/prompt";
import { convertToUIMessages } from "~/lib/utils";
import { getSandbox, touchSandboxActivity } from "~/lib/sandbox";
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
import { task_agent } from "~/lib/ai/tools/task-agent";
import { ls } from "~/lib/ai/tools/ls";
import { webscraper } from "~/lib/ai/tools/web-scrape";
import { grep } from "~/lib/ai/tools/grep";
import { read_file } from "~/lib/ai/tools/read-files";
import { delete_file } from "~/lib/ai/tools/delete-files";
import { getSession } from "~/lib/server";
import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";
import { string_replace } from "~/lib/ai/tools/string-replace";
import { checkPremiumUser } from "~/lib/check-premium";
import { google } from "@ai-sdk/google";

export async function POST(req: Request) {
  const { message, id }: { message: ChatMessage; id: string } =
    await req.json();

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
        message:
          "You've reached the plan limit.",
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
    const sandbox = await Sandbox.create("swizsandbox", {
      timeoutMs: 3_600_000,
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
    console.log("project already exists , connecting to sandbox");
    sandboxId = project.sandboxId!;
    await getSandbox(sandboxId);
  }
  // Mark activity to delay auto-pause
  if (sandboxId) {
    touchSandboxActivity(sandboxId);
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
        model: "openai/gpt-4o-mini",
      },
    ],
  });

  const messagesFromDb = await getMessagesByProjectId({ id });
  const uiMessages = [...convertToUIMessages(messagesFromDb), message];

  const result = streamText({
    messages: convertToModelMessages(uiMessages),
    model: openai("gpt-4.1-mini"),
    // model: google("gemini-2.0-flash"),
    system: PROMPT,
    temperature: 0.1,
    stopWhen: stepCountIs(10),
    experimental_transform: smoothStream({
      delayInMs: 20,
      chunking: "word",
    }),
    //toolChoice: "required",
    tools: {
      edit_file: edit_file({ sandboxId }),
      grep: grep({ sandboxId }),
      ls: ls({ sandboxId }),
      glob: glob({ sandboxId }),
      task_agent: task_agent({ sandboxId }),
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
  return result.toUIMessageStreamResponse({
    sendReasoning: false,
    onFinish: async ({ messages }) => {
      await getSandbox(sandboxId);
      // const sandboxUrl = `https://${sandbox.getHost(3000)}`;

      // Reset inactivity timer after assistant finishes work as well
      if (sandboxId) {
        touchSandboxActivity(sandboxId);
      }

      await saveMessages({
        messages: messages.map((message) => ({
          id: crypto.randomUUID(),
          role: message.role,
          parts: message.parts,
          createdAt: new Date(),
          attachments: [],
          projectId: id,
          model: "gpt-4o-mini",
          updatedAt: new Date(),
        })),
      });
    },
  });
}
