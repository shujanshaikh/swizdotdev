"use server"

import { auth } from "~/lib/auth"

export const signIn = async (email: string, password: string) => {
    try {
        const session = await auth.api.signInEmail({
            body: {
                email,
                password
            }
        })
        return {
            success: true,
            message: "Signed in successfully",
            session,
        }
    } catch (error) {
        const e = error as Error;
        return {
            success: false,
            message: {
                error: e.message ?? "An error occurred",
            }
        }
    }
}

export const signUp = async (name: string, email: string, password: string) => {
    try {
        const session = await auth.api.signUpEmail({
            body: {
                name,
            email,
            password
        }
        })
        return {
            success: true,
            message: "Signed up successfully",
            session,
        }
    } catch (error) {
        const e = error as Error;
        return {
            success: false,
            message: {
                error: e.message ?? "An error occurred",
            }
        }
    }
}