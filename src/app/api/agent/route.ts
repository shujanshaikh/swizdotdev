import {
  streamText,
  tool,
  smoothStream,
  type UIMessage,
  appendClientMessage,
  appendResponseMessages,
} from "ai";
import { openai } from "@ai-sdk/openai";
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
import { google } from "@ai-sdk/google";
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

export const maxDuration = 60;

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { message, id }: { message: UIMessage; id: string } = await req.json();
  console.log(message, "message");

  const project = await getProjectById({ id });

  let sandboxId = "";
  if (!project) {
    const title = await generateTitleFromUserMessage({
      message,
    });
    const sandbox = await Sandbox.create("swizdotdev");
    sandboxId = sandbox.sandboxId;
    
    await saveProject({
      id: id,
      title,
      sandboxId,
      sandboxUrl: `https://${sandbox.getHost(3000)}`,
    });
  } else {
    console.log("project already exists");
    console.log(project.sandboxId, "project");
    sandboxId = project.sandboxId!;
    await Sandbox.connect(sandboxId);
  }

  const previousMessages = await getMessagesByProjectId({ id });
  console.log(previousMessages, "previousMessages");

  const messages = appendClientMessage({
    // @ts-expect-error: todo add type conversion from DBMessage[] to UIMessage[]
    messages: previousMessages,
    message,
  });
  console.log(message.id);

 

  await saveMessages({
    messages: [
      {
        id: message.id ?? crypto.randomUUID(),
        projectId: id,
        model: "gemini-2.5-flash",
        role: "user",
        parts: message.parts,
        attachments: message.experimental_attachments ?? [],
        createdAt: new Date(),
        updatedAt: new Date(),
        sandboxUrl: "",
        sandboxId: "sandboxId",
      },
    ],
    versionings : {
      sandboxId : "",
      sandboxUrl : "",
      versioningTitle :""
    }
  });

  const result = streamText({
    messages,
    model: openrouter.chat("openrouter/horizon-beta"),
    temperature: 0.1,
    system: PROMPT,
    maxSteps: 10,
    maxRetries: 2,
    toolCallStreaming: true,
    experimental_transform: smoothStream({
      delayInMs: 10,
      chunking: "word",
    }),
    //toolChoice: "required",
    tools: {
      bash: tool({
        description:
          "Run a terminal command , Do not run npm run dev or any other dev command or nor the build command always use this tool to install the packages",
        parameters: z.object({
          command: z.string().describe("The terminal command to execute."),
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

      task_agent: tool({
        description:
          "Launches a highly capable task agent in the workspace. Usage notes:\n1. When the agent is done, it will return a report of its actions. This report is also visible to USER, so you don't have to repeat any overlapping information.\n2. Each agent invocation is stateless and doesn't have access to your chat history with USER. You will not be able to send additional messages to the agent, nor will the agent be able to communicate with you outside of its final report. Therefore, your prompt should contain a highly detailed task description for the agent to perform autonomously and you should specify exactly what information the agent should return back to you in its final and only message to you.\n3. The agent's outputs should generally be trusted.",
        parameters: z.object({
          prompt: z.string().describe("The task for the agent to perform."),
          integrations: z
            .array(z.string())
            .describe(
              "Choose the external services the agent should interact with.",
            ),
          relative_file_paths: z
            .array(z.string())
            .describe("Relative paths to files that are relevant to the task."),
        }),
        execute: async ({ prompt, integrations, relative_file_paths }) => {
          try {
            const sandbox = await getSandbox(sandboxId);

            // Build the command with the new parameters
            let command = `task_agent "${prompt}"`;

            // Add integrations if provided
            if (integrations && integrations.length > 0) {
              command += ` --integrations "${integrations.join(",")}"`;
            }

            // Add file paths if provided
            if (relative_file_paths && relative_file_paths.length > 0) {
              command += ` --files "${relative_file_paths.join(",")}"`;
            }

            const result = await sandbox.commands.run(command);
            return result.stdout;
          } catch (error) {
            return `Task agent execution failed: ${error}`;
          }
        },
      }),

      ls: tool({
        description:
          "List the contents of a directory. The quick tool to use for discovery, before using more targeted tools like semantic search or file reading.",
        parameters: z.object({
          relative_dir_path: z
            .string()
            .describe(
              "The relative path to the directory to list contents of.",
            ),
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
          pattern: z
            .string()
            .describe(
              "Glob pattern to match files against (e.g., '*.ts', '**/*.tsx', 'src/**/*.{js,ts}')",
            ),
          exclude_pattern: z
            .string()
            .optional()
            .describe(
              "Optional glob pattern to exclude files (e.g., '**/node_modules/**')",
            ),
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
          query: z.string().describe("The regex pattern to search for."),
          case_sensitive: z
            .boolean()
            .describe("Whether the search should be case sensitive."),
          include_pattern: z
            .string()
            .optional()
            .describe(
              "Glob pattern for files to include (e.g. '.ts' for TypeScript files)",
            ),
          exclude_pattern: z
            .string()
            .optional()
            .describe(
              "Glob pattern for files to exclude (e.g. '.test.ts' for test files).",
            ),
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
          relative_file_path: z
            .string()
            .describe("The relative path to the file to read."),
          should_read_entire_file: z
            .boolean()
            .describe("Whether to read the entire file."),
          start_line_one_indexed: z
            .number()
            .optional()
            .describe(
              "The one-indexed line number to start reading from (inclusive).",
            ),
          end_line_one_indexed: z
            .number()
            .optional()
            .describe(
              "The one-indexed line number to end reading at (inclusive).",
            ),
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
          relative_file_path: z
            .string()
            .describe("The relative path to the file to delete."),
        }),
        execute: async ({ relative_file_path }) => {
          try {
            const sandbox = await getSandbox(sandboxId);
            await sandbox.files.remove(relative_file_path);
            return `File ${relative_file_path} deleted successfully`;
          } catch (error) {
            return `Error deleting file: ${error}`;
          }
        },
      }),

      edit_file: tool({
        description: "Use this tool to write or edit a file at the specified path.",
        parameters: z.object({
          relative_file_path: z
            .string()
            .describe(
              "The relative path to the file to modify. The tool will create any directories in the path that don't exist"
            ),
          code_edit: z
            .string()
            .describe(
              "The content to write to the file"
            )
        }),
        execute: async ({ relative_file_path, code_edit }) => {
          try {
            const sandbox = await getSandbox(sandboxId);
            await sandbox.files.write(relative_file_path, code_edit);
            return `Successfully wrote to ${relative_file_path} `;
          } catch (error) {
            return `Error editing file: ${error}`;
          }
        },
      }),

      string_replace: tool({
        description:
          "Performs exact string replacements in files.\nUse this tool to make small, specific edits to a file. For example, to edit some text, a couple of lines of code, etc. Use edit_file for larger edits.\n\nEnsure you preserve the exact indentation (tabs/spaces) as it appears AFTER the line number prefix added by the read_file tool.\nOnly use this tool if you are sure that the old_string is unique in the file, otherwise use the edit_file tool.\n\nThe edit will FAIL if `old_string` is not unique in the file. Either provide a larger string with more surrounding context to make it unique or use `replace_all` to change every instance of `old_string`.\n\nUse `replace_all` for replacing and renaming strings across the file. This parameter is useful if you want to rename a variable for instance.\n\nOnly use emojis if the user explicitly requests it. Avoid adding emojis to files unless asked.",
        parameters: z.object({
          relative_file_path: z
            .string()
            .describe(
              "The relative path to the file to modify. The tool will create any directories in the path that don't exist",
            ),
          old_string: z
            .string()
            .describe(
              "The string to replace. This string must be unique in the file. If it's not, use `replace_all` to change every instance of `old_string`.",
            ),
          new_string: z
            .string()
            .describe(
              "The string to replace `old_string` with. This string must be unique in the file. If it's not, use `replace_all` to change every instance of `old_string`.",
            ),
          replace_all: z
            .boolean()
            .describe(
              "Whether to replace all instances of `old_string` in the file. If true, the tool will replace all instances of `old_string` in the file. If false, the tool will replace only the first instance of `old_string` in the file.",
            ),
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

      suggestions: tool({
        description:
          "Suggest 1-5 next steps to implement with the USER. Suggest only once and only if the user has not provided a solution.",
        parameters: z.object({
          suggestions: z
            .array(z.string())
            .describe(
              "List of 1-5 suggested next steps. No '-', bullet points, or other formatting",
            ),
        }),
        execute: async ({ suggestions }) => {
          return {
            suggestions,
            message: "Here are the suggested next steps:",
          };
        },
      }),

      web_search: tool({
        description:
          "Search the web for real-time text and image responses. For example, you can get up-to-date information that might not be available in your training data, verify current facts, or find images that you can use in your project. You will see the text and images in the response. You can use the images by using the links in the <img> tag. Use this tool to find images you can use in your project. For example, if you need a logo, use this tool to find a logo.",
        parameters: z.object({
          search_term: z
            .string()
            .describe(
              "The search term to look up on the web. Be specific and include relevant keywords for better results. For technical queries, include version numbers or dates if relevant.",
            ),
          type: z
            .enum(["text", "images"])
            .describe(
              "The type of search to perform. If `text`, the tool will search the web for text. If `images`, the tool will search the web for images.",
            ),
        }),
        execute: async ({ search_term, type }) => {
          const search = await webSearch(search_term, type);
          return search;
        },
      }),

      web_scrape: tool({
        description:
          'Scrape a website to see its design and content. Use this tool to get a website\'s title, description, content, and screenshot (if requested). Use this tool whenever USER gives you a documentation URL to read or asks you to clone a website. When using this tool, say "I\'ll visit {url}..." or "I\'ll read {url}..." and never say "I\'ll scrape".',
        parameters: z.object({
          url: z.string().describe("The URL of the website to scrape."),
          theme: z
            .enum(["light", "dark"])
            .describe(
              "The theme of the website to scrape. If `light`, the tool will scrape the website in light mode. If `dark`, the tool will scrape the website in dark mode.",
            ),
          viewport: z
            .enum(["mobile", "tablet", "desktop"])
            .describe("The viewport to scrape the website in."),
          include_screenshot: z
            .boolean()
            .describe(
              "Whether to see a screenshot of the website. Set to false when reading documentation.",
            ),
        }),
        execute: async ({ url, theme, viewport, include_screenshot }) => {
          console.log("Web scraping request received on agent route");
          try {
            const data = await scrapeWebsite({
              url,
              theme,
              viewport,
              include_screenshot,
            });

            //console.log(data, "data");
            if (!data.success) {
              return {
                error: data.error || "Failed to scrape website",
                url,
                theme,
                viewport,
              };
            }

            return {
              success: true,
              url: data.data.url,
              title: data.data.title,
              screenshot: data.data.screenshot,
              viewport: data.data.viewport,
              theme: data.data.theme,
            };
          } catch (error) {
            console.error("Tool execution error:", error);
            return {
              error: `Failed to scrape ${url}: ${error}`,
              url,
              theme,
              viewport,
            };
          }
        },
      }),
    },
    onFinish: async ({ response }) => {
      const sandbox = await getSandbox(sandboxId);
      const sandboxUrl = `https://${sandbox.getHost(3000)}`;
      
      setTimeout(
        async () => {
          try {
            await sandbox.pause();
            console.log(
              `Sandbox ${sandbox.sandboxId} auto-paused after 3 minutes`,
            );
          } catch (error) {
            console.error("Failed to auto-pause sandbox:", error);
          }
        },
        3 * 60 * 1000,
      );

      console.log(sandboxUrl, "sandboxUrl");

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
            sandboxId: sandboxId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        versionings : {
          sandboxId : sandboxId ,
          sandboxUrl : sandboxUrl,
          versioningTitle : "New Sandbox"
        }
      });
    },
  });
  result.consumeStream();

  return result.toDataStreamResponse();
}
