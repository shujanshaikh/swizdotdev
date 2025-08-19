"use client";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, Clock, Archive, Plus } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

import { Sidebar, SidebarContent } from "~/components/ui/sidebar";
import { api } from "~/trpc/react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { authClient } from "~/lib/auth-client";
import { FREE_PLAN_MESSAGE_COUNT } from "~/utils/constant";

export default function SidebarComponent() {
  const projects = api.project.getProjects.useQuery();
  const resumeSandboxMutation = api.message.resumeSandbox.useMutation();
  const { data: session } = authClient.useSession();
  const { data: credits } = api.premium.getCredits.useQuery(undefined, {
    enabled: !!session,
  });

  const router = useRouter();

  const usedCount = credits?.usedCount ?? 0;
  const planLimit = credits?.planLimit ?? FREE_PLAN_MESSAGE_COUNT;
  const percentUsed = Math.min(100, Math.round((usedCount / planLimit) * 100));

  const filterOptions = [
    { label: "Last 7 days", days: 7 },
    { label: "Last 30 days", days: 30 },
    { label: "Last 90 days", days: 90 },
    { label: "All projects", days: null },
  ];

  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleProjectClick = async (projectId: string) => {
    try {
      console.log("Resuming sandbox for project:", projectId);

      const result = await resumeSandboxMutation.mutateAsync({ projectId });

      if (result.success) {
        console.log("Sandbox resumed successfully:", result.sandboxId);
        router.push(`/project/${projectId}`);
      } else {
        console.error("Failed to resume sandbox:", result.message);
      }
    } catch (error) {
      console.error("Error resuming sandbox:", error);
      router.push(`/project/${projectId}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredProjects =
    projects.data?.filter((project) => {
      if (selectedFilter?.days === null) return true;

      const filterDate = new Date();
      filterDate.setDate(filterDate.getDate() - (selectedFilter?.days || 7));

      const projectDate = project.updatedAt
        ? new Date(project.updatedAt)
        : project.createdAt
          ? new Date(project.createdAt)
          : null;

      return projectDate && projectDate >= filterDate;
    }) || [];

  const displayProjects =
    selectedFilter?.days === null
      ? filteredProjects
      : filteredProjects.slice(0, 12);

  return (
    <Sidebar
      side="left"
      variant="sidebar"
      collapsible="offcanvas"
      className="relative border-r-0 bg-zinc-950/70 backdrop-blur-xl"
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-900" />

      <div className="pointer-events-none absolute inset-0 z-0 [mask-image:radial-gradient(70%_50%_at_10%_0%,black,transparent)]">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.22),transparent_60%)] blur-2xl" />
        <div className="absolute top-1/3 -right-20 h-60 w-60 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.18),transparent_60%)] blur-2xl" />
      </div>

      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:22px_22px]" />

      <SidebarContent className="relative z-10 flex flex-col bg-transparent">
        <div className="flex items-center justify-between p-8 pb-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-700/60 to-zinc-800/60 shadow-sm ring-1 ring-white/10">
              <Image
                src="/logo.svg"
                alt="Swiz"
                width={18}
                height={18}
                className="opacity-90"
              />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-white">
                swizdotdev
              </h1>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8">
          <Button
            onClick={() => router.push("/")}
            className="group w-full rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 py-2.5 text-sm font-medium text-zinc-100 shadow-sm ring-1 ring-white/10 transition-all hover:from-zinc-700/80 hover:to-zinc-800/80 hover:text-white"
          >
            <Plus className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
            New Project
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="px-8 pb-4">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-zinc-200"
              >
                <Clock className="h-4 w-4" />
                {selectedFilter?.label}
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${showFilterDropdown ? "rotate-180" : ""}`}
                />
              </button>

              {showFilterDropdown && (
                <div className="absolute top-full left-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-white/10 bg-zinc-900/90 shadow-2xl backdrop-blur-xl">
                  {filterOptions.map((option) => (
                    <button
                      key={option.label}
                      onClick={() => {
                        setSelectedFilter(option);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm transition-colors first:rounded-t-xl last:rounded-b-xl ${
                        selectedFilter?.label === option.label
                          ? "bg-zinc-800/80 text-white"
                          : "text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1 px-8">
            <div className="scrollbar-hide h-full overflow-y-auto">
              <div className="space-y-1.5 pb-8">
                {projects.isLoading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="rounded-xl p-2.5">
                      <Skeleton className="h-4 w-2/3 rounded-md bg-zinc-700/70" />
                    </div>
                  ))
                ) : displayProjects.length > 0 ? (
                  displayProjects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleProjectClick(project.id)}
                      className="group relative w-full rounded-xl border border-transparent bg-zinc-900/40 p-2.5 text-left transition-all duration-200 hover:scale-[1.01] hover:border-white/10 hover:bg-zinc-900/60"
                    >
                      <div className="truncate text-sm font-medium text-zinc-100 group-hover:text-white">
                        {project.title}
                      </div>
                      <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity [background:radial-gradient(120px_40px_at_10%_10%,rgba(244,244,245,0.06),transparent)] group-hover:opacity-100" />
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center py-12 text-center">
                    <Archive className="mb-3 h-8 w-8 text-zinc-600" />
                    <div className="text-sm text-zinc-400">No projects</div>
                    <div className="text-xs text-zinc-500">
                      {selectedFilter?.days === null
                        ? "Get started"
                        : "Try a different filter"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {session && credits ? (
          <div className="border-t border-white/10 px-6 py-4">
            <div className="w-full">
              <div className="w-full rounded-lg border border-white/5 bg-zinc-900/30 p-3">
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
                  <div className="flex items-center gap-1">
                    {!credits?.isPremium ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 rounded-full px-3 text-[11px] text-violet-400 hover:text-violet-300"
                        onClick={() => router.push('/settings/subscription')}
                      >
                        Upgrade
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex h-7 items-center gap-1.5 rounded-full px-3 text-[11px] text-zinc-400 hover:text-zinc-300"
                      onClick={() => router.push('/settings')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      Settings
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </SidebarContent>
    </Sidebar>
  );
}
