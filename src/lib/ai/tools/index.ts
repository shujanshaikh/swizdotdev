import type { InferUITool } from "ai"
import { edit_file } from "./edit-files"
import { grep } from "./grep"
import { ls } from "./ls"
import { glob } from "./glob"
import { task_agent } from "./task-agent"
import { bash } from "./bash"
import { webscraper } from "./web-scrape"
import { web_search } from "./web-search"
import { suggestions } from "./suggestion"

interface Params {
    sandboxId: string
  }
  
  export function tools({ sandboxId }: Params) {
    return {
      grep: grep({sandboxId}),
      ls: ls({sandboxId}),
      glob: glob({sandboxId}),
      task_agent: task_agent({sandboxId}),
      bash: bash({sandboxId}),
      webScraper: webscraper,
      webSearch: web_search,
      suggestion: suggestions,
      edit_file: edit_file({sandboxId }),
    }
  }
  
  export type ToolSet = ReturnType<typeof tools>