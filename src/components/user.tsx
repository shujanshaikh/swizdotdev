"use client"
import { authClient } from "~/lib/auth-client" // import the auth client
 
export function User(){
 
    const { 
        data: session, 
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = authClient.useSession() 
 
    return (
        <div>
            <h1>User</h1>
        </div>
    )
}