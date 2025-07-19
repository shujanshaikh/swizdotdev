import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";

export interface AIProvider {
  id: string;
  name: string;
  category: string;
  description: string;
}

export const MODELS: AIProvider[] = [
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 flash",
    category: "Basic",
    description: "Basic model , Cheaper",
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 flash",
    category: "Basic",
    description: "Basic model , Cheaper",
  },
  {
    id: "claude-4-sonnet-20250514",
    name: "Claude 4 Sonnet",
    category: "Agentic",
    description: "Antropic latest model , for daily use",
  },
  {
    id: "claude-3-5-sonnet-20240620",
    name: "Claude 3.5 Sonnet",
    category: "Agentic",
    description: "Antropic latest model , for daily use",
  },
  {
    id: "claude-3-7-sonnet-20250219",
    name: "Claude 3.5 Sonnet",
    category: "Agentic",
    description: "Antropic latest model , for daily use",
  },
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    category: "Basic",
    description: "OpenAI latest model , Cheaper",
  },
  {
    id: "4o-mini",
    name: "4o Mini",
    category: "Slightly Better",
    description: "OpenAI latest model , Cheaper",
  },
] as const;

export const DEFAULT_MODEL = "gemini-2.5-flash" as const;

export const getModel = (modelName: string) => {
  switch (modelName) {
    case "gemini-2.5-flash":
      return google("gemini-2.5-flash");
    case "gemini-2.0-flash":
      return google("gemini-2.0-flash");
    case "claude-4-sonnet":
      return anthropic("claude-4-sonnet-20250514");
    case "claude-3-5-sonnet":
      return anthropic("claude-3-5-sonnet-20240620");
    case "claude-3-7-sonnet":
      return anthropic("claude-3-7-sonnet-20250219");
    case "gpt-4.1":
      return openai("gpt-4.1");
    case "4o-mini":
      return openai("gpt-4o-mini");
    default:
      return google(DEFAULT_MODEL);
  }
};

export const getModelInfo = (modelId : string) => {
  return MODELS.find((model) => model.id === modelId);
};



export const getModelInfobyName = (): Record<string , AIProvider[]> => {
  return MODELS.reduce(
    (acc , model) => {
        if(!acc[model.name]){
            acc[model.name] = []
        }
        acc[model.name]!.push(model);
        return acc

    },
    {} as Record<string , AIProvider[]>
  )
}