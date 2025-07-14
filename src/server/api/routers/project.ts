import z from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { createProject } from "~/server/db/queries";

export const projectRouter = createTRPCRouter({
  createProject: publicProcedure
    .input(z.object({ title: z.string() }))
    .mutation(async ({ input }) => {
      const { title } = input;
      const projectId = await createProject({ title });
      return projectId;
    }),
});
