export const models = [
  {
    name : "Minimax M2",
    value : "minimax/minimax-m2",
    description : "MiniMax-M2 redefines efficiency for agents. It is a compact, fast, and cost-effective MoE model",
  },
  {
    name: "GPT 5-mini",
    value: "openai/gpt-5-mini",
    description: "Fast, cheap, efficient",
  },
  // {
  //   name: "Kimi-K2-0905",
  //   value: "moonshotai/kimi-k2-0905",
  //   description: "Model from moonshotai"
  // } ,
  
   {
    name : "GLM 4.6",
    value : "zai/glm-4.6",
    description : "Zai's model"
   },

   {
    name: "DeepSeek V3.1",
    value: "deepseek/deepseek-v3.1",
    description: "Low cost, good performance"
  },

  // {
  //   name: "Claude 3.5 sonnet",
  //   value: "anthropic/claude-3.5-sonnet",
  //   description: "Code focused, reasonable cost",
  // }
]


export const defaultModel = models[0]?.value || "openai/gpt-5-nano";