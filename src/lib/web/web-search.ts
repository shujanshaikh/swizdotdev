import Exa from "exa-js";

export const exa = new Exa(process.env.EXA_API_KEY);

export async function webSearch(
  search_term: string,
  type: "text" | "images" = "text",
) {
  try {
    const { results } = await exa.searchAndContents(search_term, {
      livecrawl: "always",
      numResults: 3,
      includeImages: type === "images",
      stream: true,
    });
    if (type === "text") {
      return results.map((result) => ({
        title: result.title,
        url: result.url,
        content: result.text.slice(0, 1000),
        publishedDate: result.publishedDate,
      }));
    } else if (type === "images") {
      return results.map((result) => ({
        title: result.title,
        url: result.url,
        content: result.text.slice(0, 1000),
        publishedDate: result.publishedDate,
        image: result.image,
      }));
    }
  } catch (error) {
    console.error(" Web search error:", error);
    return [
      {
        title: "Search Error",
        url: "",
        content: `Unable to perform web search: ${error instanceof Error ? error.message : "Unknown error"}`,
        publishedDate: null,
      },
    ];
  }
}
