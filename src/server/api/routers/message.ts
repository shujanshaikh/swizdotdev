import z from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { getMessagesByProjectId, getSanboxId } from "~/server/db/queries";
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
    .query(async ({ input }) => {
      return getMessagesByProjectId({ id: input.projectId });
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
      const sandboxId = await getSanboxId(input.projectId);
      if (!sandboxId) {
        return {
          success: false,
          sandboxId: null,
          message: "No sandbox found for this project. Please start a conversation first."
        };
      }
      const resumedSandbox = await Sandbox.connect(sandboxId , {
        //autoPause: true,
        requestTimeoutMs: 900_000,
        timeoutMs: 900_000,
      });
      console.log('Sandbox resumed', resumedSandbox.sandboxId);
      return {
        success: true,
        sandboxId: resumedSandbox.sandboxId,
        message: "Sandbox resumed successfully"
      };
    }),
});
