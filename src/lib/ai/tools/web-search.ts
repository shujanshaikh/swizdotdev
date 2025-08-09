import { tool } from "ai";
import { z } from "zod";
import { webSearch } from "~/lib/web/web-search";

export const web_search  =  tool({
    description:
      "Search the web for real-time text and image responses. For example, you can get up-to-date information that might not be available in your training data, verify current facts, or find images that you can use in your project. You will see the text and images in the response. You can use the images by using the links in the <img> tag. Use this tool to find images you can use in your project. For example, if you need a logo, use this tool to find a logo.",
    inputSchema: z.object({
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
  })
