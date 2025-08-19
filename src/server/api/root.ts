import { projectRouter } from "~/server/api/routers/project";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { messageRouter } from "./routers/message";  
import { premiumRouter } from "./routers/premium";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  project: projectRouter,
  message: messageRouter,
  premium: premiumRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
