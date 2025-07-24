import z from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { message } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { getSanboxId } from "~/server/db/queries";
import { Sandbox } from "@e2b/code-interpreter";
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
      messageId: z.string(),
    })).query(async ({ ctx, input }) => {
      const sandboxUrl = await ctx.db.query.message.findFirst({
        where: eq(message.id, input.messageId),
      });
      return sandboxUrl?.sandboxUrl;
    }),

    getSandboxId: publicProcedure.input(z.object({
      projectId: z.string(),
    })).query(async ({  input }) => {
      const sandboxId = await getSanboxId(input.projectId);
      return sandboxId;
    }),

    resumeSandbox: publicProcedure.input(z.object({
      projectId: z.string(),
    })).mutation(async ({ input }) => {
      try {
        const sandboxId = await getSanboxId(input.projectId);
        if (!sandboxId) {
          return {
            success: false,
            sandboxId: null,
            message: "No sandbox found for this project. Please start a conversation first."
          };
        }
        const resumedSandbox = await Sandbox.resume(sandboxId);
        console.log('Sandbox resumed', resumedSandbox.sandboxId);
        return {
          success: true,
          sandboxId: resumedSandbox.sandboxId,
          message: "Sandbox resumed successfully"
        };
      } catch (error) {
        console.error('Failed to resume sandbox:', error);
        return {
          success: false,
          sandboxId: null,
          message: `Failed to resume sandbox: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }),
});
