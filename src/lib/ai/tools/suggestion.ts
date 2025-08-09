import { tool } from "ai";
import z from "zod";

export const suggestions= tool({
    description:
      "Suggest 1-5 next steps to implement with the USER. Suggest only once and only if the user has not provided a solution.",
    inputSchema: z.object({
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
  })