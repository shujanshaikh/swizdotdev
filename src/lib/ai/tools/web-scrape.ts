
import { tool } from "ai";
import { z } from "zod";
import { scrapeWebsite } from "~/lib/web/web-scraper";


export const webscraper = tool({
    description:
      'Scrape a website to see its design and content. Use this tool to get a website\'s title, description, content, and screenshot (if requested). Use this tool whenever USER gives you a documentation URL to read or asks you to clone a website. When using this tool, say "I\'ll visit {url}..." or "I\'ll read {url}..." and never say "I\'ll scrape".',
    inputSchema: z.object({
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
  });
  