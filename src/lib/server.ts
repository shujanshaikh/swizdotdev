import { auth } from "~/lib/auth"
import { headers } from "next/headers"
 
export const getSession = async () => {
    "use server";
    const session = await auth.api.getSession({
        headers: await headers()
    })
    return session;
};