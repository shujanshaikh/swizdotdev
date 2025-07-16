import z from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { createProject, getProjects } from "~/server/db/queries";

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
});
