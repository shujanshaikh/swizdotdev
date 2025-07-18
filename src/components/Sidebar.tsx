import { useState, useEffect, useRef } from "react";
import { PanelLeftClose, ChevronDown, Plus, Clock, Archive } from "lucide-react";
import { Skeleton } from "./ui/skeleton";


import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "~/components/ui/sidebar";
import { api } from "~/trpc/react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import Image from "next/image";
export default function SidebarComponent() {
  const projects = api.project.getProjects.useQuery();
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
      .slice(0, 7) || [];

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
        <div className="flex w-full items-center justify-between px-4 py-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl blur-sm"></div>
              <div className="relative bg-gradient-to-br from-zinc-800 to-zinc-900 p-2 rounded-xl border border-zinc-700/50">
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
              <span className="font-semibold text-2xl text-white tracking-tight">
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
            className="w-full bg-gradient-to-r from-zinc-800 to-zinc-700 hover:from-zinc-700 hover:to-zinc-600 border border-zinc-600/50 text-white font-medium py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-zinc-900/20"
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
                className="flex items-center gap-2 text-xs font-semibold tracking-wider text-zinc-300 uppercase transition-all duration-200 hover:text-white group"
              >
                <Clock className="w-3 h-3" />
                {selectedFilter?.label || "Recent Projects"}
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${showFilterDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showFilterDropdown && (
                <div className="absolute top-full left-0 z-50 mt-2 min-w-40 rounded-xl border border-zinc-700/50 bg-zinc-900/95 backdrop-blur-sm shadow-xl">
                  {filterOptions.map((option, index) => (
                    <button
                      key={option.label}
                      onClick={() => {
                        setSelectedFilter(option);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm transition-all duration-200 ${
                        index === 0 ? 'rounded-t-xl' : ''
                      } ${
                        index === filterOptions.length - 1 ? 'rounded-b-xl' : ''
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
              <div className="h-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                <SidebarMenu className="space-y-2 px-1">
                  {projects.isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <SidebarMenuItem key={`skeleton-${index}`}>
                        <div className="flex items-center gap-3 px-3 py-3 rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-zinc-700 animate-pulse"></div>
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
                          <button
                            onClick={() => navigate(`/project/${project.id}`)}
                            className="group flex w-full cursor-pointer items-center gap-3 px-3 py-3 text-left rounded-lg hover:bg-zinc-800/60 transition-all duration-200"
                          >
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-60 group-hover:opacity-100 transition-opacity duration-200"></div>
                            <div className="min-w-0 flex-1">
                              <span className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors duration-200 truncate block">
                                {project.title}
                              </span>
                              <div className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors duration-200">
                                {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'Recent'}
                              </div>
                            </div>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  ) : (
                    <div className="px-3 py-8 text-center">
                      <Archive className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                      <p className="text-sm text-zinc-400 mb-1">
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
        <div className="px-4 pt-4 border-t border-zinc-800/50">
          <div className="text-xs text-zinc-500 text-center">
            Built with ❤️ by swizdotdev
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
