import {type CoreMessage, streamText, tool  , smoothStream} from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { Sandbox } from "@e2b/code-interpreter";
import { PROMPT } from "~/lib/prompt";
import { getSandbox } from "~/lib/utils";


export async function POST(req: Request) {
  const { messages }: { messages: CoreMessage[] } = await req.json();

  // Create sandbox
  const sandbox = await Sandbox.create("zite-npm");
  const sandboxId = sandbox.sandboxId;

  const result = streamText({
    messages,
    model: google("gemini-2.5-flash-preview-04-17"), // or use gemini
    system: PROMPT,
    toolCallStreaming: true,
    experimental_transform: smoothStream({
        delayInMs: 10, 
        chunking: 'word', 
      }),
    tools: {
      terminal: tool({
        description: "Use the terminal to run commands",
        parameters: z.object({
          command: z.string(),
        }),
        execute: async ({ command }) => {
          const buffer = { stdout: "", stderr: "" };
          try {
            const sandbox = await getSandbox(sandboxId);
            const result = await sandbox.commands.run(command, {
              onStdout: (data) => {
                buffer.stdout += data;
              },
              onStderr: (data) => {
                buffer.stderr += data;
              },
            });
            return result.stdout;
          } catch (e) {
            return `Command failed : ${e as Error} \nstdout ${
              buffer.stdout
            } \nstderr ${buffer.stderr}`;
          }
        },
      }),

      createOrUpdateFile: tool({
        description: "Create or update a file in the sandbox",
        parameters: z.object({
          files: z.array(
            z.object({
              path: z.string(),
              content: z.string(),
            })
          ),
        }),
        execute: async ({ files }) => {
          try {
            const sandbox = await getSandbox(sandboxId);
            for (const file of files) {
              await sandbox.files.write(file.path, file.content);
            }
            return files.map((file) => file.path);
          } catch (error) {
            return `Error creating files: ${error}`;
          }
        },
      }),

      readFiles: tool({
        description: "Read the contents of files",
        parameters: z.object({
          files: z.array(z.string()),
        }),
        execute: async ({ files }) => {
          try {
            const sandbox = await getSandbox(sandboxId);
            const contents = [];
            for (const file of files) {
              const content = await sandbox.files.read(file);
              contents.push({ path: file, content });
            }
            return JSON.stringify(contents);
          } catch (error) {
            return `Error reading files: ${error}`;
          }
        },
      }),
    },
    maxSteps: 10,

    onFinish: async ({ response }) => {
      const sandboxUrl = `https://${sandbox.getHost(3000)}`;
      console.log(sandboxUrl);
      messages.push(...response.messages);
    },
  });



  return result.toDataStreamResponse();
}
