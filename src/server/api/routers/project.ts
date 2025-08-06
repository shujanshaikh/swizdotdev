import { eq } from "drizzle-orm";
import z from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { createProject, getProjects } from "~/server/db/queries";
import { project } from "~/server/db/schema";

export const projectRouter = createTRPCRouter({
  createProject: publicProcedure
    .input(z.object({ title: z.string() }))
    .mutation(async ({ input }) => {
      const { title } = input;
      const projectId = await createProject({ title });
      return projectId;
    }),

  getProjects: publicProcedure.query(async () => {
    const projects = await getProjects();
    return projects;
  }),

  getSandboxUrl: publicProcedure.input(z.object({
    projectId: z.string(),
  })).query(async ({ ctx, input }) => {
    const projectData = await ctx.db.query.project.findFirst({
      where: eq(project.id, input.projectId),
    });
    return projectData?.sandboxUrl ?? null;
  }),

});
