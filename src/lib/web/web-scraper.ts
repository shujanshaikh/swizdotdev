export async function scrapeWebsite({ url, theme, viewport, include_screenshot }: {
    url: string;
    theme: 'light' | 'dark';
    viewport: 'mobile' | 'tablet' | 'desktop';
    include_screenshot: boolean;
  }) {
    const WORKER_URL = 'http://localhost:8787';
    
    const response = await fetch(`${WORKER_URL}/web-scraper`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        theme,
        viewport,
        include_screenshot
      })
    });
  
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
  
    return await response.json();
  }