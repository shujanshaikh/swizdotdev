"use client";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { authClient } from "~/lib/auth-client";
import Image from "next/image";

type PolarPrice = {
  amountType?: string;
  priceAmount?: number;
};

function formatUsd(cents: number | undefined) {
  if (!cents || isNaN(cents)) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function UserAvatar({
  name,
  imageUrl,
}: {
  name?: string | null;
  imageUrl?: string | null;
}) {
  const initial = (name?.trim()?.[0] || "U").toUpperCase();
  return (
    <div className="relative inline-flex size-14 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-zinc-800 text-lg font-semibold text-zinc-200">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name ?? "User"}
          width={56}
          height={56}
          className="size-full object-cover"
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}

export default function Setting() {
  const { data: session } = authClient.useSession();

  const { data: currentSubscription, isLoading: subscriptionLoading } =
    api.premium.getCurrentSubscription.useQuery();
  const { data: products, isLoading: productsLoading } =
    api.premium.getProducts.useQuery();
  const { data: credits, isLoading: creditsLoading } =
    api.premium.getCredits.useQuery();

  const user = session?.user;
  const isPremium = Boolean(credits?.isPremium);
  const planLimit = credits?.planLimit ?? 0;
  const usedCount = credits?.usedCount ?? 0;
  const remaining = credits?.remaining ?? 0;
  const usagePct =
    planLimit > 0
      ? Math.min(100, Math.round((usedCount / planLimit) * 100))
      : 0;

  return (
    <div className="relative z-0 min-h-screen w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-900" />
      <div className="pointer-events-none absolute inset-0 z-0 [mask-image:radial-gradient(70%_50%_at_50%_-10%,black,transparent)]">
        <div className="absolute top-0 left-1/4 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.25),transparent_60%)] blur-2xl" />
        <div className="absolute top-1/3 right-0 h-[22rem] w-[22rem] translate-x-1/4 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.20),transparent_60%)] blur-2xl" />
      </div>
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:22px_22px]" />

      <div className="relative z-10 mx-auto w-full max-w-5xl space-y-6 px-4 py-8 md:px-6 md:py-12">
        <Button asChild variant="outline" className="mb-4">
          <Link href="/" className="gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Back to Home
          </Link>
        </Button>

        <div className="space-y-2">
          <h1 className="bg-gradient-to-b from-white via-zinc-200 to-zinc-400 bg-clip-text text-3xl font-semibold tracking-tight text-transparent md:text-4xl">
            Settings
          </h1>
          <p className="text-zinc-400">
            Manage your profile, subscription, and usage.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <UserAvatar
                  name={user?.name}
                  imageUrl={
                    (user as { image?: string | null } | undefined)?.image ??
                    undefined
                  }
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-base font-medium text-zinc-100">
                      {user?.name ?? "Unnamed"}
                    </p>
                    {isPremium && (
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-300">
                        Premium
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm text-zinc-400">
                    {user?.email ?? "No email"}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    ID: {user?.id ?? "—"}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button variant="outline" onClick={() => authClient.signOut()}>
                Sign out
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage</CardTitle>
              <CardDescription>Your monthly message limits</CardDescription>
            </CardHeader>
            <CardContent>
              {creditsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-zinc-400">
                    <span>Used</span>
                    <span>
                      {usedCount} / {planLimit}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-800">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${usagePct}%` }}
                    />
                  </div>
                  <p className="text-sm text-zinc-400">
                    Remaining:{" "}
                    <span className="text-zinc-200">{remaining}</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>
                  {subscriptionLoading
                    ? "Checking your subscription..."
                    : isPremium
                      ? "You have an active subscription"
                      : "You are on the free plan"}
                </CardDescription>
              </div>
              {isPremium && currentSubscription && (
                <div className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-zinc-300">
                  <div className="font-medium text-zinc-100">
                    {currentSubscription.name}
                  </div>
                  <div className="text-zinc-400">
                    {formatUsd(
                      (
                        currentSubscription.prices?.[0] as
                          | PolarPrice
                          | undefined
                      )?.amountType === "fixed"
                        ? (
                            currentSubscription.prices?.[0] as
                              | PolarPrice
                              | undefined
                          )?.priceAmount
                        : 0,
                    )}
                    /mo
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {productsLoading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-3 rounded-xl border p-4">
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-8 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : !products || products.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center text-zinc-400">
                  No products found
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => {
                    const firstPrice = product.prices?.[0] as
                      | PolarPrice
                      | undefined;
                    const amount =
                      firstPrice?.amountType === "fixed"
                        ? firstPrice?.priceAmount
                        : 0;
                    return (
                      <div
                        key={product.id}
                        className="flex flex-col justify-between rounded-xl border p-4"
                      >
                        <div className="space-y-1">
                          <div className="text-base font-medium text-zinc-100">
                            {product.name}
                          </div>
                          <div className="text-sm text-zinc-400">
                            {product.description}
                          </div>
                        </div>
                        <Separator className="my-4" />
                        <div className="flex items-end justify-between">
                          <div className="text-2xl font-semibold text-zinc-100">
                            {formatUsd(amount)}
                            <span className="text-sm font-normal text-zinc-400">
                              /mo
                            </span>
                          </div>
                          <Button
                            onClick={() => {
                              authClient.checkout({ products: [product.id] });
                            }}
                          >
                            {isPremium ? "Change plan" : "Subscribe"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
            {!isPremium && (
              <CardFooter className="text-sm text-zinc-400">
                Upgrade to unlock higher limits and premium features.
              </CardFooter>
            )}
          </Card>
        </div>

        <div className="pt-2 text-center text-xs text-zinc-500">
          Managed by Polar billing. Your subscription updates instantly.
        </div>
      </div>
    </div>
  );
}
