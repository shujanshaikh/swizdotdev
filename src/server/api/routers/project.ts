import { eq } from "drizzle-orm";
import z from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getProjects } from "~/server/db/queries";
import { project } from "~/server/db/schema";
import { getSession } from "~/lib/server";

export const projectRouter = createTRPCRouter({
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
