import { tool } from "ai";
import { z } from "zod";
import { crawlUrl } from "~/lib/web/fire-crawl";

export const webscraper = tool({
  description:
    'This tool is used to scrape a website to get its screenshot. Use this tool to get a website\'s screenshot.',
  inputSchema: z.object({
    url: z.string().describe("The URL of the website to scrape."),
  }),
  execute: async ({ url }) => {
    const crawlResponse = await crawlUrl(url);
    return crawlResponse;
  },
});
