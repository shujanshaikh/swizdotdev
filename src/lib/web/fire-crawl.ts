import FirecrawlApp from '@mendable/firecrawl-js';

const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

export async function crawlUrl(url: string) {
  try {
    const scrapeResult = await app.scrape(url, {
      formats: ["screenshot"], 
      waitFor: 3000, 
      timeout: 30000,
      onlyMainContent: false, 
      actions: [
        {
          type: 'wait',
          milliseconds: 2000 
        }
      ]
    });
  
    if (!scrapeResult) {
      throw new Error(`Failed to crawl: ${scrapeResult}`);
    }
    return scrapeResult.screenshot;
  } catch (error) {
    return `Error crawling: ${error}`;
  }
}

