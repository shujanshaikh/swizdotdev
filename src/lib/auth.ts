import { betterAuth } from "better-auth";
import { db } from "~/server/db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { user, session, account, verification } from "~/server/db/schema";
import { nextCookies } from "better-auth/next-js";
import { env } from "~/env";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: { user, session, account, verification },
    }),
    emailAndPassword: {
        enabled: true,
    },
    plugins: [nextCookies()],
    socialProviders: {
        google: { 
            clientId: env.GOOGLE_CLIENT_ID!, 
            clientSecret: env.GOOGLE_CLIENT_SECRET!, 
        }, 
    },
});