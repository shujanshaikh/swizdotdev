import { tool } from "ai";
import { z } from "zod";
import { getSandbox } from "~/lib/sandbox";

interface Params {
  sandboxId: string;
}

export const task_agent = ({ sandboxId }: Params) => tool({
  description:
    "Use this tool to create a .swiz folder in the root of the workspace and manage todo files that track tasks the AI needs to perform and has completed",
  inputSchema: z.object({
    action: z.enum(["create_folder", "add_todo", "mark_complete", "list_todos"]).describe("Action to perform: create the .swiz folder, add a new todo, mark a todo as complete, or list all todos"),
    todo_text: z.string().optional().describe("The todo task description (required for add_todo action)"),
    todo_id: z.string().optional().describe("The ID of the todo to mark as complete (required for mark_complete action)"),
  }),
  execute: async ({ action, todo_text, todo_id }) => {
    try {
      const sandbox = await getSandbox(sandboxId);

      switch (action) {
        case "create_folder":
          // Create the .swiz folder by writing a placeholder file
          await sandbox.files.write(".swiz/.gitkeep", "# This file ensures the .swiz folder exists");
          return "Successfully created .swiz folder in the root of the workspace";

        case "add_todo":
          if (!todo_text) {
            return "Error: todo_text is required for add_todo action";
          }

          // Generate a unique ID for the 
          const timestamp = Date.now();
          const todoId = `todo_${timestamp}`;

          // Create the todo file
          const todoContent = `# TODO: ${todo_text}

            **Status:** Pending
            **Created:** ${new Date().toISOString()}
            **Completed:** 

            ## Description
            ${todo_text}

           ## Notes
          - [ ] Task not yet started`;

          await sandbox.files.write(`.swiz/${todoId}.md`, todoContent);

          // Update the main todos index file
          await updateTodosIndex(sandbox, todoId, todo_text, "pending");

          return `Successfully added todo: ${todo_text}`;

        case "mark_complete":
          if (!todo_id) {
            return "Error: todo_id is required for mark_complete action";
          }

          try {
            // Read the existing todo file
            const todoPath = `.swiz/${todo_id}.md`;
            const existingContent = await sandbox.files.read(todoPath);

            // Update the status to completed
            const updatedContent = existingContent.replace(
              "**Status:** Pending",
              "**Status:** Completed"
            ).replace(
              "**Completed:** ",
              `**Completed:** ${new Date().toISOString()}`
            ).replace(
              "- [ ] Task not yet started",
              "- [x] Task completed"
            );

            await sandbox.files.write(todoPath, updatedContent);

            // Update the main todos index file
            await updateTodosIndex(sandbox, todo_id, "", "completed");

            return `Successfully marked todo as completed`;
          } catch (error) {
            return `Error updating todo: ${error}`;
          }

        case "list_todos":
          try {
            // Read the todos index file
            const indexContent = await sandbox.files.read(".swiz/todos.md");
            return `Current todos:\n\n${indexContent}`;
          } catch (error) {
            return "No todos found or error reading todos index";
          }

        default:
          return `Unknown action: ${action}`;
      }
    } catch (error) {
      return `Error in task agent: ${error}`;
    }
  },
});

async function updateTodosIndex(sandbox: Awaited<ReturnType<typeof getSandbox>>, todoId: string, todoText: string, status: string) {
  try {
    let indexContent = "";

    try {
      indexContent = await sandbox.files.read(".swiz/todos.md");
    } catch (error) {
      // File doesn't exist, create initial content
      indexContent = `# AI Task Management

## Active Todos
`;

    }

    if (status === "pending") {
      // Add new todo to the index
      const newTodoEntry = `### ${todoId}
- **Task:** ${todoText}
- **Status:** Pending
- **Created:** ${new Date().toISOString()}

`;

      // Insert new todo at the top of active todos
      const activeTodosIndex = indexContent.indexOf("## Active Todos");
      if (activeTodosIndex !== -1) {
        const beforeActive = indexContent.substring(0, activeTodosIndex + "## Active Todos".length);
        const afterActive = indexContent.substring(activeTodosIndex + "## Active Todos".length);
        indexContent = beforeActive + "\n" + newTodoEntry + afterActive;
      } else {
        indexContent += newTodoEntry;
      }
    } else if (status === "completed") {
      // Move todo from active to completed section
      const todoPattern = new RegExp(`### ${todoId}[\\s\\S]*?(?=### |$)`, 'g');
      const todoMatch = indexContent.match(todoPattern);

      if (todoMatch) {
        const todoEntry = todoMatch[0];
        const updatedEntry = todoEntry.replace("**Status:** Pending", "**Status:** Completed");

        // Remove from active todos
        indexContent = indexContent.replace(todoPattern, '');

        // Add to completed section
        if (indexContent.includes("## Completed Todos")) {
          const completedIndex = indexContent.indexOf("## Completed Todos");
          const beforeCompleted = indexContent.substring(0, completedIndex + "## Completed Todos".length);
          const afterCompleted = indexContent.substring(completedIndex + "## Completed Todos".length);
          indexContent = beforeCompleted + "\n" + updatedEntry + afterCompleted;
        } else {
          indexContent += "\n## Completed Todos\n" + updatedEntry;
        }
      }
    }

    await sandbox.files.write(".swiz/todos.md", indexContent);
  } catch (error) {
    console.error("Error updating todos index:", error);
  }
}
