export const models = [
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
    name: "GPT 4.1",
    value: "openai/gpt-4.1",
    description: "Balanced performance, mid-cost",
  },
  {
    name: "GPT 4o mini",
    value: "openai/gpt-4o-mini",
    description: "Good balance, affordable",
  },

  
  {
    name : "Gemini 2.0 Flash",
    value : "google/gemini-2.0-flash",
    description : "Google's cheapest model"
  } ,
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