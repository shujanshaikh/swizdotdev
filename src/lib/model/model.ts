export const models = [
  {
    name: "Sonoma Sky Alpha",
    value: "stealth/sonoma-sky-alpha",
    description: "A maximally intelligent general-purpose frontier model with a 2 million token context window"
  },
  {
    name : "Grok 4 Fast Reasoning",
    value : "xai/grok-4-fast-reasoning",
    description : "Grok 4 Fast Reasoning is a fast and powerful model that can reason about complex problems"
  },
  {
    name: "GPT 5-mini",
    value: "openai/gpt-5-mini",
    description: "Fast, cheap, efficient",
  },
  {
    name: "GPT 5 nano",
    value: "openai/gpt-5-nano",
    description: "Ultra-fast, ultra-cheap",
  },
  {
    name: "Kimi-K2-0905",
    value: "moonshotai/kimi-k2-0905",
    description: "Model from moonshotai"
  } ,
  {
    name: "DeepSeek V3.1",
    value: "deepseek/deepseek-v3.1",
    description: "Low cost, good performance"
  },
   {
    name : "GLM 4.5",
    value : "zai/glm-4.5",
    description : "Zai's model"
   }
  // {
  //   name: "GPT 5",
  //   value: "openai/gpt-5",
  //   description: "Most capable, expensive",
  // },


  // {
  //   name: "Claude 4 sonnet",
  //   value: "anthropic/claude-sonnet-4",
  //   description: "Code expert, premium price",
  // },

  // {
  //   name: "Claude 3.5 sonnet",
  //   value: "anthropic/claude-3.5-sonnet",
  //   description: "Code focused, reasonable cost",
  // }
]


export const defaultModel = models[0]?.value || "openai/gpt-5-nano";