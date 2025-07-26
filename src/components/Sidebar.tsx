import { useState, useEffect, useRef } from "react";
import { ChevronDown, Clock, Archive, Plus, PanelLeft } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

import {
  Sidebar,
  SidebarContent,
  useSidebar,
} from "~/components/ui/sidebar";
import { api } from "~/trpc/react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import Image from "next/image";

export default function SidebarComponent() {
  const projects = api.project.getProjects.useQuery();
  const resumeSandboxMutation = api.message.resumeSandbox.useMutation();

  const navigate = useNavigate();

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
      navigate(`/project/${projectId}`);
      const result = await resumeSandboxMutation.mutateAsync({ projectId });

      if (result.success) {
        console.log("Sandbox resumed successfully:", result.sandboxId);
        
      } else {
        console.error("Failed to resume sandbox:", result.message);

      }
    } catch (error) {
      console.error("Error resuming sandbox:", error);
      navigate(`/project/${projectId}`);
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

  const filteredProjects = projects.data?.filter((project) => {
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

  const displayProjects = selectedFilter?.days === null 
    ? filteredProjects 
    : filteredProjects.slice(0, 12);

  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar
      side="left"
      variant="sidebar"
      collapsible="offcanvas"
      className="border-r-0 bg-zinc-900"
    >
      <SidebarContent className="flex flex-col bg-transparent">
        <div className="flex items-center justify-between p-8 pb-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-800 shadow-sm">
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
          <button
            onClick={toggleSidebar}
            className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
        </div>

        <div className="px-8 pb-8">
          <Button
            onClick={() => navigate("/")}
            className="w-full rounded-lg bg-zinc-800 py-2.5 text-sm font-medium text-zinc-100 hover:bg-zinc-700 hover:text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="px-8 pb-4">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200"
              >
                <Clock className="h-4 w-4" />
                {selectedFilter?.label}
                <ChevronDown className={`h-3 w-3 transition-transform ${showFilterDropdown ? "rotate-180" : ""}`} />
              </button>

              {showFilterDropdown && (
                <div className="absolute left-0 top-full z-50 mt-2 w-40 rounded-lg border border-zinc-700 bg-zinc-800 shadow-lg">
                  {filterOptions.map((option) => (
                    <button
                      key={option.label}
                      onClick={() => {
                        setSelectedFilter(option);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm first:rounded-t-lg last:rounded-b-lg ${
                        selectedFilter?.label === option.label
                          ? "bg-zinc-700 text-white"
                          : "text-zinc-300 hover:bg-zinc-700/50 hover:text-white"
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
            <div className="h-full overflow-y-auto scrollbar-hide">
              <div className="space-y-1 pb-8">
                {projects.isLoading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="rounded-lg p-2.5">
                      <Skeleton className="h-4 w-2/3 bg-zinc-700" />
                    </div>
                  ))
                ) : displayProjects.length > 0 ? (
                  displayProjects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleProjectClick(project.id)}
                      className="group w-full rounded-lg p-2.5 text-left transition-all duration-200 hover:bg-zinc-800"
                    >
                      <div className="truncate text-sm font-bold text-zinc-100 group-hover:text-white">
                        {project.title}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center py-12 text-center">
                    <Archive className="mb-3 h-8 w-8 text-zinc-600" />
                    <div className="text-sm text-zinc-400">No projects</div>
                    <div className="text-xs text-zinc-500">
                      {selectedFilter?.days === null ? "Get started" : "Try a different filter"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 p-6 pt-4">
          <div className="text-center text-xs text-zinc-500">
            Made by swizdotdev
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
