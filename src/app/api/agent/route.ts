import {
  streamText,
  tool,
  smoothStream,
  type UIMessage,
  appendClientMessage,
  appendResponseMessages,
} from "ai";
import { openai } from '@ai-sdk/openai';
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { Sandbox } from "@e2b/code-interpreter";
import { PROMPT } from "~/lib/prompt";
import { getSandbox, getTrailingMessageId } from "~/lib/utils";
import { webSearch } from "~/lib/web/web-search";
import {
  getMessagesByProjectId,
  getProjectById,
  saveMessages,
  saveProject,
} from "~/server/db/queries";
import { generateTitleFromUserMessage } from "~/lib/generate-title";
import { scrapeWebsite } from "~/lib/web/web-scraper";

export async function POST(req: Request) {
  const { message, id }: { message: UIMessage; id: string } = await req.json();
  console.log(message, "message");

  const project = await getProjectById({ id });

  if (!project) {
    const title = await generateTitleFromUserMessage({
      message,
    });

    await saveProject({
      id: id,
      title,
    });
  } else {
    console.log("project already exists");
  }

  const previousMessages = await getMessagesByProjectId({ id });
  console.log(previousMessages, "previousMessages");

  const messages = appendClientMessage({
    // @ts-expect-error: todo add type conversion from DBMessage[] to UIMessage[]
    messages: previousMessages,
    message,
  });


  const sandbox = await Sandbox.create("zite-npm");
  const sandboxId = sandbox.sandboxId;

  await saveMessages({
    messages: [
      {
        id: message.id,
        projectId: id,
        model: "gemini-2.5-flash",
        role: 'user',
        parts: message.parts,
        attachments: message.experimental_attachments ?? [],
        createdAt: new Date(), 
        updatedAt: new Date(),
        sandboxUrl: "",
      },
    ],
  });


  const result = streamText({
    messages,
    model: google("gemini-2.0-flash"),
    system: PROMPT,
    toolCallStreaming: true,
    maxSteps: 10,
    toolChoice: "required",
    experimental_transform: smoothStream({
      delayInMs: 10,
      chunking: "word",
    }),
    tools: {
      bash: tool({
        description:
          "Run a terminal command",
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
          } catch (error) {
            return `Command failed to execute: ${command}\nOutput: ${buffer.stdout}\nError: ${buffer.stderr}\nError: ${error}`;
          }
        },
      }),

      ls: tool({
        description:
          "List the contents of a directory. The quick tool to use for discovery, before using more targeted tools like semantic search or file reading.",
        parameters: z.object({
          relative_dir_path: z.string(),
        }),
        execute: async ({ relative_dir_path }) => {
          try {
            const sandbox = await getSandbox(sandboxId);
            const result = await sandbox.commands.run(
              `ls -la ${relative_dir_path}`,
            );
            return result.stdout;
          } catch (error) {
            return `Error listing directory: ${error}`;
          }
        },
      }),

      glob: tool({
        description:
          "Search for files using glob patterns. Supports patterns like *.ts, **/*.tsx, src/**/*.{js,ts}, etc.",
        parameters: z.object({
          pattern: z.string(),
          exclude_pattern: z.string().optional(),
        }),
        execute: async ({ pattern, exclude_pattern }) => {
          try {
            const sandbox = await getSandbox(sandboxId);
            let command = `find . -name "${pattern}"`;
            if (exclude_pattern) {
              command += ` ! -path "${exclude_pattern}"`;
            }
            const result = await sandbox.commands.run(command);
            return result.stdout;
          } catch (error) {
            return `Error searching files: ${error}`;
          }
        },
      }),

      grep: tool({
        description:
          "Fast text-based regex search that finds exact pattern matches within files or directories, utilizing the ripgrep command for efficient searching.",
        parameters: z.object({
          query: z.string(),
          case_sensitive: z.boolean(),
          include_pattern: z.string().optional(),
          exclude_pattern: z.string().optional(),
        }),
        execute: async ({
          query,
          case_sensitive,
          include_pattern,
          exclude_pattern,
        }) => {
          try {
            const sandbox = await getSandbox(sandboxId);
            let command = `grep -r ${case_sensitive ? "" : "-i"} "${query}"`;
            if (include_pattern) {
              command += ` --include="${include_pattern}"`;
            }
            if (exclude_pattern) {
              command += ` --exclude="${exclude_pattern}"`;
            }
            command += " .";
            const result = await sandbox.commands.run(command);
            return result.stdout;
          } catch (error) {
            return `Error searching: ${error}`;
          }
        },
      }),

      read_file: tool({
        description:
          "Read the contents of a file. For text files, the output will be the 1-indexed file contents from start_line_one_indexed to end_line_one_indexed_inclusive.",
        parameters: z.object({
          relative_file_path: z.string(),
          should_read_entire_file: z.boolean(),
          start_line_one_indexed: z.number().optional(),
          end_line_one_indexed: z.number().optional(),
        }),
        execute: async ({
          relative_file_path,
          should_read_entire_file,
          start_line_one_indexed,
          end_line_one_indexed,
        }) => {
          try {
            const sandbox = await getSandbox(sandboxId);
            if (should_read_entire_file) {
              const content = await sandbox.files.read(relative_file_path);
              return content;
            } else {
              const command = `sed -n '${start_line_one_indexed},${end_line_one_indexed}p' ${relative_file_path}`;
              const result = await sandbox.commands.run(command);
              return result.stdout;
            }
          } catch (error) {
            return `Error reading file: ${error} ${relative_file_path} ${start_line_one_indexed} ${end_line_one_indexed}`;
          }
        },
      }),

      delete_file: tool({
        description:
          "Deletes a file at the specified path. The operation will fail gracefully if the file doesn't exist.",
        parameters: z.object({
          relative_file_path: z.string(),
        }),
        execute: async ({ relative_file_path }) => {
          try {
            await getSandbox(sandboxId);
            await sandbox.commands.run(`rm -f ${relative_file_path}`);
            return `File ${relative_file_path} deleted successfully`;
          } catch (error) {
            return `Error deleting file: ${error}`;
          }
        },
      }),

      edit_file: tool({
        description:
          "Use this tool to make large edits or refactorings to an existing file or create a new file.",
        parameters: z.object({
          relative_file_path: z.string(),
          instructions: z.string(),
          code_edit: z.string(),
          smart_apply: z.boolean(),
        }),
        execute: async ({ relative_file_path, instructions, code_edit }) => {
          try {
            const sandbox = await getSandbox(sandboxId);
            await sandbox.files.write(relative_file_path, code_edit);
            return `File ${relative_file_path} edited successfully. Instructions: ${instructions} ${code_edit}`;
          } catch (error) {
            return `Error editing file: ${error} ${relative_file_path} ${instructions} ${code_edit}`;
          }
        },
      }),

      string_replace: tool({
        description:
          "Performs exact string replacements in files. Use this tool to make small, specific edits to a file.",
        parameters: z.object({
          relative_file_path: z.string(),
          old_string: z.string(),
          new_string: z.string(),
          replace_all: z.boolean(),
        }),
        execute: async ({
          relative_file_path,
          old_string,
          new_string,
          replace_all,
        }) => {
          try {
            const sandbox = await getSandbox(sandboxId);
            const content = await sandbox.files.read(relative_file_path);
            const updatedContent = replace_all
              ? content.replaceAll(old_string, new_string)
              : content.replace(old_string, new_string);
            await sandbox.files.write(relative_file_path, updatedContent);
            return `String replacement completed in ${relative_file_path}`;
          } catch (error) {
            return `Error replacing string: ${error}`;
          }
        },
      }),

      run_linter: tool({
        description:
          "Run linter on the project",
        parameters: z.object({
        }),
          execute: async () => {
            try {
            const sandbox = await getSandbox(sandboxId);
            const result = await sandbox.commands.run(
              `npm run lint`,
            );
            return result.stdout;
          } catch (error) {
            return `Linter error: ${error}`;
          }
        },
      }),

      suggestions: tool({
        description: "Suggest 1-5 next steps to implement with the USER. Suggest only once and only if the user has not provided a solution.",
        parameters: z.object({
          suggestions: z.array(z.string()),
        }),
        execute: async ({ suggestions }) => {
          return {
            suggestions,
            message: "Here are the suggested next steps:",
          };
        },
      }),

      web_search: tool({
        description: "Search the web for real-time text and image responses.",
        parameters: z.object({
          search_term: z.string(),
          type: z.enum(["text", "images"]),
        }),
        execute: async ({ search_term, type }) => {
          const search = await webSearch(search_term, type);
          return search;
        },
      }),

      web_scrape: tool({
        description: "Scrape a website to see its design and content.",
        parameters: z.object({
          url: z.string(),
          theme: z.enum(["light", "dark"]),
          viewport: z.enum(["mobile", "tablet", "desktop"]),
          include_screenshot: z.boolean(),
        }),
        execute: async ({ url, theme, viewport, include_screenshot }) => {
          console.log("Web scraping request received on agent route");
          try {
            const data = await scrapeWebsite({ url, theme, viewport, include_screenshot });
      
            console.log(data, "data");
            if (!data.success) {
              return {
                error: data.error || 'Failed to scrape website',
                url,
                theme,
                viewport
              };
            }
    
            return {
              success: true,
              url: data.data.url,
              title: data.data.title,
              screenshot: data.data.screenshot,
              viewport: data.data.viewport,
              theme: data.data.theme,
              sessionInfo: data.data.sessionInfo,
              scrapedAt: new Date().toISOString()
            };
      
          } catch (error) {
            console.error('Tool execution error:', error);
            return {
              error: `Failed to scrape ${url}: ${error}`,
              url,
              theme,
              viewport
            };
          }
        },
      }),
    },
    onFinish: async ({ response }) => {
      const sandboxUrl = `https://${sandbox.getHost(3000)}`;
      console.log(sandboxUrl);

      const assistantId = getTrailingMessageId({
        messages: response.messages.filter(
          (message) => message.role === "assistant",
        ),
      });

      if (!assistantId) {
        throw new Error("No assistant message found!");
      }

      const [, assistantMessage] = appendResponseMessages({
        messages: [message],
        responseMessages: response.messages,
      });

      await saveMessages({
        messages: [
          {
            id: crypto.randomUUID(),
            projectId: id,
            model: "gemini-2.5-flash",
            role: assistantMessage!.role,
            parts: assistantMessage?.parts ?? [],
            attachments: assistantMessage?.experimental_attachments ?? [],
            sandboxUrl: sandboxUrl,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });
    },
  });
  result.consumeStream();

  return result.toDataStreamResponse();
}
