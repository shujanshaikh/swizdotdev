"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { z } from "zod"

import { Button } from "~/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { Separator } from "~/components/ui/separator"
import { signUp } from "~/server/user"
import { toast } from "sonner"
import { authClient } from "~/lib/auth-client"
import { useRouter } from "next/navigation"

const formSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Enter a valid email" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(6, { message: "Confirm your password" }),
  })
  .refine((vals) => vals.password === vals.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })

export default function SignupPage() {
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      const { success, message } = await signUp(values.name, values.email, values.password)

      if (!success) {
        toast.error(message.toString() ?? "An error occurred")
        return
      }
      toast.success("Signed up successfully")
      router.push("/")
    } finally {
      setIsSubmitting(false)
    }
  }

  const signInWithGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-transparent">
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-900" />

      <div className="pointer-events-none absolute inset-0 z-0 [mask-image:radial-gradient(70%_50%_at_50%_-10%,black,transparent)]">
        <div className="absolute left-1/4 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.25),transparent_60%)] blur-2xl" />
        <div className="absolute right-0 top-1/3 h-[24rem] w-[24rem] translate-x-1/4 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.20),transparent_60%)] blur-2xl" />
      </div>

      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:22px_22px]" />

      <div className="relative z-10 flex flex-1 items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md translate-y-[-6vh] space-y-8">
          <div className="space-y-3 text-center md:space-y-4">
            <h1 className="bg-gradient-to-b from-white via-zinc-200 to-zinc-400 bg-clip-text text-3xl font-semibold tracking-tight text-transparent md:text-4xl">
              Create your account
            </h1>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-zinc-400 md:text-base">
              Start building apps by prompting
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 rounded-xl border border-white/10 bg-zinc-900/70 p-6 backdrop-blur">
              <Button
                type="button"
                className="w-full bg-white text-zinc-900 hover:bg-zinc-100 border border-zinc-200 shadow"
                onClick={signInWithGoogle}
                aria-label="Continue with Google"
              >
                <svg className="size-4" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.652-6.08,8-11.303,8c-6.627,0-12-5.373-12-12S17.373,12,24,12c3.059,0,5.842,1.139,7.971,3.003l5.657-5.657C34.919,6.209,29.73,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.349,43.611,20.083z"/>
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.818C14.809,16.076,19.034,13.5,24,13.5c3.059,0,5.842,1.139,7.971,3.003l5.657-5.657C34.919,6.209,29.73,4,24,4C16.319,4,9.587,8.292,6.306,14.691z"/>
                  <path fill="#4CAF50" d="M24,44c5.173,0,9.862-2.012,13.311-5.289l-6.151-5.219C29.209,35.897,26.769,36.5,24,36.5c-5.151,0-9.477-3.309-11.101-7.937l-6.56,5.046C9.591,39.708,16.319,44,24,44z"/>
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.747,2.104-2.137,3.912-3.892,5.233c0.002-0.001,0.004-0.002,0.006-0.004l6.151,5.219C38.87,37.135,44,31.33,44,24C44,22.659,43.862,21.349,43.611,20.083z"/>
                </svg>
                <span>Continue with Google</span>
              </Button>

              <div className="flex items-center gap-3">
                <Separator className="flex-1 basis-0 bg-white/10" />
                <span className="text-xs text-zinc-400">or</span>
                <Separator className="flex-1 basis-0 bg-white/10" />
              </div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating account…" : "Create account"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
