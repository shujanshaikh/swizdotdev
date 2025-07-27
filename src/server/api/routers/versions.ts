import z from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { versioning } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const versionsRouter = createTRPCRouter({
  getVersionByMessageId: publicProcedure
    .input(
      z.object({
        messageId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const versions = await ctx.db.query.versioning.findMany({
        where: eq(versioning.messageId, input.messageId),
      });

      return versions;
    }),
});
