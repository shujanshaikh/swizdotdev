import Sandbox from "@e2b/code-interpreter";
import { eq } from "drizzle-orm";
import z from "zod";
import { generateTitleFromUserMessage } from "~/lib/generate-title";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getProjectById, getProjects, saveProject } from "~/server/db/queries";
import { project } from "~/server/db/schema";
import { getSession } from "~/lib/server";

export const projectRouter = createTRPCRouter({
  createProject: publicProcedure
    .input(z.object({ id: z.string(), message: z.any() }))
    .mutation(async ({ input }) => {
      const session = await getSession();
      const userId = session?.user.id;
      if (!userId) {
        throw new Error("Unauthorized");
      }
      const { id, message } = input;
      const project = await getProjectById({ id });
      let sandboxId;
      if (!project) {
        const title = await generateTitleFromUserMessage({
          message,
        });
        const sandbox = await Sandbox.create("swizdotdev");
        sandboxId = sandbox.sandboxId;

        await saveProject({
          id: id,
          title,
          sandboxId,
          sandboxUrl: `https://${sandbox.getHost(3000)}`,
          userId,
        });
        console.log(`https://${sandbox.getHost(3000)}`, "freom project");
      } else {
        console.log("project already exists , connecting to sandbox");
        sandboxId = project.sandboxId!;
        await Sandbox.connect(sandboxId);
      }
      return sandboxId;
    }),

  getProjects: publicProcedure.query(async () => {
    const session = await getSession();
    const userId = session?.user.id;
    if (!userId) {
      return [];
    }
    const projects = await getProjects({ userId });
    return projects;
  }),

  getSandboxUrl: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const projectData = await ctx.db.query.project.findFirst({
        where: eq(project.id, input.projectId),
      });
      return projectData?.sandboxUrl ?? null;
    }),
});
