import { betterAuth } from "better-auth";
import { db } from "~/server/db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { user, session, account, verification } from "~/server/db/schema";
import { nextCookies } from "better-auth/next-js";
import { env } from "~/env";
import { polarClient } from "./polar";
import { checkout, polar, portal } from "@polar-sh/better-auth";

export const auth = betterAuth({

    database: drizzleAdapter(db, {
        provider: "pg",
        schema: { user, session, account, verification },
    }),
    emailAndPassword: {
        enabled: true,
    },
    plugins: [nextCookies() , polar({
        client: polarClient,
        createCustomerOnSignUp : true,
       use : [
        checkout({
            authenticatedUsersOnly : true,
            successUrl : '/',
        }),
        portal()
       ]
    })],
    socialProviders: {
        google: { 
            clientId: env.GOOGLE_CLIENT_ID!, 
            clientSecret: env.GOOGLE_CLIENT_SECRET!, 
        }, 
    },
});