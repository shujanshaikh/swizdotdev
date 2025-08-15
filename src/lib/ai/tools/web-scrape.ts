import { tool } from "ai";
import { z } from "zod";
import { crawlUrl } from "~/lib/web/fire-crawl";

export const webscraper = tool({
  description:
    'Scrape a website to see its design and content. Use this tool to get a website\'s title, description, content, and screenshot (if requested). Use this tool whenever USER gives you a documentation URL to read or asks you to clone a website. When using this tool, say "I\'ll visit {url}..." or "I\'ll read {url}..." and never say "I\'ll scrape".',
  inputSchema: z.object({
    url: z.string().describe("The URL of the website to scrape."),
  }),
  execute: async ({ url }) => {
    const crawlResponse = await crawlUrl(url);
    return crawlResponse;
  },
});
