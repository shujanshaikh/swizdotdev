import { tool } from "ai";
import { z } from "zod";
import { webSearch } from "~/lib/web/web-search";

export const web_search  =  tool({
    description:
      "Search the web for real-time text and image responses. For example, you can get up-to-date information that might not be available in your training data, verify current facts, or find images that you can use in your project. You will see the text and images in the response. You can use the images by using the links in the <img> tag. Use this tool to find images you can use in your project. For example, if you need a logo, use this tool to find a logo.",
    inputSchema: z.object({
      url: z
        .string()
        .describe("The URL of the website to search."),
      format: z
        .array(z.enum(["markdown", "html"]))
        .describe("The format of the search to perform."),
    }),
    execute: async ({ url, format }) => {
      const search = await webSearch(url, format as ["markdown", "html" , "links"]);
      return search.toString();
    },
  })
