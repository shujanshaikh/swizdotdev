import FirecrawlApp from "@mendable/firecrawl-js";

const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

export async function crawlUrl(url: string) {
  const crawlResponse = await app.crawlUrl(url, {
    limit: 1,
    scrapeOptions: {
      formats: [ 
        "screenshot" , "html"],
    },
  });

  if (!crawlResponse.success) {
    throw new Error(`Failed to crawl: ${crawlResponse.error}`);
  }
  return crawlResponse;
}
