"use client"

import Image from "next/image"
import Link from "next/link"
import { authClient } from "~/lib/auth-client"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu"
import { api } from "~/trpc/react"
import { FREE_PLAN_MESSAGE_COUNT } from "~/utils/constant"


function UserAvatar({
    name,
    imageUrl,
    size = 36,
}: {
    name?: string | null
    imageUrl?: string | null
    size?: number
}) {
    const initial = (name?.trim()?.[0] || "U").toUpperCase()
    return (
        <div
            className="relative inline-flex items-center justify-center overflow-hidden rounded-full
                 border border-white/10 bg-zinc-800 text-xs font-semibold text-zinc-200"
            style={{ width: size, height: size }}
        >
            {imageUrl ? (
                <Image
                    src={imageUrl || "/placeholder.svg?height=36&width=36&query=user%20avatar"}
                    alt={name ?? "User"}
                    width={size}
                    height={size}
                    className="h-full w-full object-cover"
                />
            ) : (
                <span>{initial}</span>
            )}
        </div>
    )
}

export default function UserProfile() {
    const { data: session } = authClient.useSession()
    const user = session?.user
    if (!user) return null

    const { data: credits, isLoading: creditsLoading } = api.premium.getCredits.useQuery(undefined, {
        enabled: !!session,
    })

    const usedCount = credits?.usedCount ?? 0
    const planLimit = credits?.planLimit ?? FREE_PLAN_MESSAGE_COUNT
    const percentUsed = Math.min(100, Math.round((usedCount / planLimit) * 100))

    const imageUrl = (user as { image?: string | null } | undefined)?.image ?? undefined
    const name = user.name ?? "User"
    const email = (user as { email?: string | null } | undefined)?.email ?? null

    async function handleSignOut() {
        try {
            await authClient.signOut()
        } catch (err) {
            console.log("sign out error", err)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    aria-label="Open user menu"
                    className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                    <UserAvatar name={name} imageUrl={imageUrl} />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64 p-0 overflow-hidden bg-popover text-popover-foreground">
                <div className="flex items-center gap-3 p-3 border-b border-border bg-popover">
                    <UserAvatar name={name} imageUrl={imageUrl} size={40} />
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{name}</p>
                        {email ? <p className="truncate text-xs text-muted-foreground">{email}</p> : null}
                    </div>
                </div>

                <div className="p-3 border-b border-border bg-popover/50">
                    {creditsLoading ? (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Loading...</span>
                        </div>
                    ) : (
                        <div className="w-full">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-zinc-200">{credits?.isPremium ? "Pro plan" : "Free plan"}</span>
                                <span className="text-[11px] text-zinc-500">{usedCount}/{planLimit}</span>
                            </div>
                            <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-800/80">
                                <div
                                    className="h-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all duration-300"
                                    style={{ width: `${percentUsed}%` }}
                                />
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-[11px] text-zinc-500">{percentUsed}% used</span>
                                {!credits?.isPremium ? (
                                    <DropdownMenuItem asChild className="cursor-pointer p-1 h-auto">
                                        <Link href="/settings/subscription" className="text-xs text-violet-400 hover:text-violet-300">
                                            Upgrade
                                        </Link>
                                    </DropdownMenuItem>
                                ) : null}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-1">
                    <DropdownMenuLabel className="text-xs text-muted-foreground">Account</DropdownMenuLabel>
                    <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/settings">Settings</Link>
                    </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator />

                <div className="p-1">
                    <DropdownMenuItem
                        className="cursor-pointer text-red-500 focus:text-red-500"
                        onSelect={() => {
                            void handleSignOut()
                        }}
                    >
                        Sign out
                    </DropdownMenuItem>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
