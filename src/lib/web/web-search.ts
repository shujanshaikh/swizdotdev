import FirecrawlApp from '@mendable/firecrawl-js';

export const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY! });

interface WebSearchInput {
  url: string;
  format: ['markdown', 'html'], 
  options: {
    livecrawl: 'always',
    numResults: 3,
    includeImages: boolean,
    stream: boolean,
  }
}


export async function webSearch(
  url: string,
  format: ['markdown', 'html' , "links"],
  options?: {
    livecrawl: 'always',
    numResults: 3,
    includeImages: boolean,
    onlyMainContent: boolean,
    waitFor: number,
    timeout: number,
    stream: boolean,
  }
) {
  try {
    const scrapeResult = await app.scrape(url, {
      formats: format,
      ...options // Pass through any additional options
    });
    return scrapeResult;
  } catch (error) {
    return `Error searching: ${error}`;
  }
}
