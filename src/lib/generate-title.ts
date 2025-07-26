import { google } from "@ai-sdk/google";
import { generateText, type UIMessage } from "ai";

export async function generateTitleFromUserMessage({
    message,
  }: {
    message: UIMessage;
  }) {
    const { text: title } = await generateText({
      model: google("gemini-2.0-flash"),
      system: `\n
      - Use single emoji for the title use emoji at first then the title
      - you will generate a short title based on the first message a user begins a conversation with
      - ensure it is not more than 80 characters long
      - the title should be a summary of the user's message
      - do not use quotes or colons
      `,
      prompt: JSON.stringify(message),
    });
  
    return title;
  }