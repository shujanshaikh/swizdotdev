import z from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { message } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const messageRouter = createTRPCRouter({
  getMessages: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.message.findMany();
  }),

  getMessagesByProjectId: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
    const messages = await ctx.db.query.message.findMany({
        where: eq(message.projectId, input.projectId),
      });
      return messages;
    }),

    getSandboxUrl: publicProcedure.input(z.object({
      projectId: z.string(),
    })).query(async ({ ctx, input }) => {
      const messages = await ctx.db.query.message.findMany({
        where: eq(message.id, input.projectId),
      });
      return messages.find((message) => message.sandboxUrl)?.sandboxUrl;
    }),
});
