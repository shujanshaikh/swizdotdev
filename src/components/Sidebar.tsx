import { useState, useEffect, useRef } from "react";
import { PanelLeftClose, ChevronDown, Clock, Archive } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
    { label: "All time", days: null },
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

  const recentProjects =
    projects.data
      ?.filter((project) => {
        if (selectedFilter?.days === null) return true;

        const filterDate = new Date();
        filterDate.setDate(filterDate.getDate() - (selectedFilter?.days || 7));

        const projectDate = project.updatedAt
          ? new Date(project.updatedAt)
          : project.createdAt
            ? new Date(project.createdAt)
            : null;

        return projectDate && projectDate >= filterDate;
      })
      .slice(0, 12) || [];

  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar
      side="left"
      variant="sidebar"
      collapsible="none"
      className="overflow-hidden border-r border-zinc-800/30 bg-gradient-to-b from-zinc-900 to-zinc-950"
    >
      <SidebarContent className="flex flex-col overflow-hidden bg-transparent py-4">
        {/* Header */}
        <div className="mb-2 flex w-full items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-sm"></div>
              <div className="relative rounded-xl border border-zinc-700/50 bg-gradient-to-br from-zinc-800 to-zinc-900 p-2">
                <Image
                  src="/logo.svg"
                  alt="Swiz"
                  width={20}
                  height={20}
                  className="flex-shrink-0"
                />
              </div>
            </div>
            <div>
              <span className="text-2xl font-semibold tracking-tight text-white">
                swizdotdev
              </span>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-2 text-zinc-400 transition-all duration-200 hover:bg-zinc-800/60 hover:text-zinc-200"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        {/* New Project Button */}
        <div className="mb-6 px-4">
          <Button
            onClick={() => navigate("/")}
            className="w-full rounded-xl border border-zinc-600/50 bg-gradient-to-r from-zinc-800 to-zinc-700 py-3 font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:from-zinc-700 hover:to-zinc-600 hover:shadow-lg hover:shadow-zinc-900/20"
          >
            New Project
          </Button>
        </div>

        {/* Projects Section */}
        <SidebarGroup className="min-h-0 flex-1 px-4">
          {/* Filter Header */}
          <div className="mb-4">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="group flex items-center gap-2 text-xs font-semibold tracking-wider text-zinc-300 uppercase transition-all duration-200 hover:text-white"
              >
                <Clock className="h-3 w-3" />
                {selectedFilter?.label || "Recent Projects"}
                <ChevronDown
                  className={`h-3 w-3 transition-transform duration-200 ${showFilterDropdown ? "rotate-180" : ""}`}
                />
              </button>

              {showFilterDropdown && (
                <div className="absolute top-full left-0 z-50 mt-2 min-w-40 rounded-xl border border-zinc-700/50 bg-zinc-900/95 shadow-xl backdrop-blur-sm">
                  {filterOptions.map((option, index) => (
                    <button
                      key={option.label}
                      onClick={() => {
                        setSelectedFilter(option);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm transition-all duration-200 ${
                        index === 0 ? "rounded-t-xl" : ""
                      } ${
                        index === filterOptions.length - 1 ? "rounded-b-xl" : ""
                      } hover:bg-zinc-800/60 ${
                        selectedFilter?.label === option.label
                          ? "bg-zinc-800 text-white"
                          : "text-zinc-300 hover:text-white"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Projects List */}
          <SidebarGroupContent className="min-h-0 flex-1">
            <div className="group relative h-full">
              <div className="scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent h-full overflow-x-hidden overflow-y-auto">
                <SidebarMenu className="space-y-2 px-1">
                  {projects.isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <SidebarMenuItem key={`skeleton-${index}`}>
                        <div className="flex items-center gap-3 rounded-lg px-3 py-3">
                          <div className="h-2 w-2 animate-pulse rounded-full bg-zinc-700"></div>
                          <div className="flex-1">
                            <Skeleton className="h-4 w-4/5 rounded-md bg-zinc-800" />
                          </div>
                        </div>
                      </SidebarMenuItem>
                    ))
                  ) : recentProjects.length > 0 ? (
                    recentProjects.map((project) => (
                      <SidebarMenuItem key={project.id}>
                        <SidebarMenuButton
                          asChild
                          className="rounded-lg transition-all duration-200"
                        >
                          <Button
                          variant="ghost"
                            onClick={() => handleProjectClick(project.id)}
                            className="group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-left transition-all duration-200 hover:bg-zinc-800/60"
                          >
                            <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-60 transition-opacity duration-200 group-hover:opacity-100"></div>
                            <div className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-zinc-200 transition-colors duration-200 group-hover:text-white">
                                {project.title}
                              </span>
                              <div className="text-xs text-zinc-500 transition-colors duration-200 group-hover:text-zinc-400">
                                {project.updatedAt
                                  ? new Date(
                                      project.updatedAt,
                                    ).toLocaleDateString()
                                  : "Recent"}
                              </div>
                            </div>
                          </Button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  ) : (
                    <div className="px-3 py-8 text-center">
                      <Archive className="mx-auto mb-3 h-8 w-8 text-zinc-600" />
                      <p className="mb-1 text-sm text-zinc-400">
                        No projects yet
                      </p>
                      <p className="text-xs text-zinc-500">
                        {selectedFilter?.label?.toLowerCase() || "recently"}
                      </p>
                    </div>
                  )}
                </SidebarMenu>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer */}
        <div className="border-t border-zinc-800/50 px-4 pt-4">
          <div className="text-center text-xs text-zinc-500">
            Built with ❤️ by swizdotdev
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
