"use client";
import { Archive, Plus } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

import { Sidebar, SidebarContent } from "~/components/ui/sidebar";
import { api } from "~/trpc/react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { audiowide } from "~/lib/font";
import { toast } from "sonner";
import { useState } from "react";
import { Spinner } from "./ui/spinner";

export default function SidebarComponent() {
  const projects = api.project.getProjects.useQuery();
  const resumeSandboxMutation = api.message.resumeSandbox.useMutation();
  const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null);

  const router = useRouter();

  const handleProjectClick = async (projectId: string) => {
    try {
      setLoadingProjectId(projectId);
      const result = await resumeSandboxMutation.mutateAsync({ projectId });

      if (result.success) {
        toast.success("Sandbox resumed successfully");
        router.push(`/project/${projectId}`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Error resuming sandbox");
    } finally {
      setLoadingProjectId(null);
    }
  };


  const displayProjects = projects.data || [];

  return (
    <Sidebar
      side="left"
      variant="inset"
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
            <div className="flex h-8 w-8 items-center justify-center rounded-xl ">
              <Image
                src="/logo.svg"
                alt="Swiz"
                width={28}
                height={28}
                className="opacity-90"
              />
            </div>
            <div>
              <h1 className={`text-3xl font-semibold tracking-tight text-white items-center justify-center ${audiowide.className}`}>
                swiz
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
                      <div className="flex items-center gap-2">
                        <div className="truncate text-sm font-semibold text-zinc-100 group-hover:text-white leading-tight">
                          {project.title}
                        </div>
                        {loadingProjectId === project.id && (
                          <Spinner className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                        )}
                      </div>
                      <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity [background:radial-gradient(120px_40px_at_10%_10%,rgba(244,244,245,0.06),transparent)] group-hover:opacity-100" />
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center py-12 text-center">
                    <Archive className="mb-3 h-8 w-8 text-zinc-600" />
                    <div className="text-sm text-zinc-400">No projects</div>
                    <div className="text-xs text-zinc-500">
                      Get started
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
