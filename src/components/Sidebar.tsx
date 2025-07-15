"use client";

import { useState, useEffect, useRef } from "react";
import { PanelLeftClose, ChevronDown } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
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

  // Close dropdown when clicking outside
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
      className="overflow-hidden border-r border-zinc-800/50 bg-zinc-950"
    >
      <SidebarHeader className="border-b border-zinc-800/30 bg-zinc-950 px-5 py-5">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Swiz"
              width={24}
              height={24}
              className="flex-shrink-0"
            />
            <span className="font-poppins text-2xl font-semibold tracking-wide text-white">
              swizdotdev
            </span>
          </div>
          <button
            onClick={toggleSidebar}
            className="rounded-md p-1.5 transition-all duration-200 hover:bg-zinc-800/40"
          >
            <PanelLeftClose className="h-4 w-4 text-zinc-500 hover:text-zinc-300" />
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex flex-col overflow-hidden bg-zinc-950 py-3">
        <div className="mb-4 px-3">
          <Button
            variant="secondary"
            className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2.5 font-medium text-white shadow-sm transition-all duration-200"
            onClick={() => {
              // Handle new project creation
              console.log("Create new project");
            }}
          >
            New Project
          </Button>
        </div>

        <SidebarGroup className="min-h-0 flex-1 px-3">
          <div className="mb-3">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2 text-xs font-medium tracking-wide text-zinc-400 uppercase transition-colors hover:text-zinc-300"
              >
                {selectedFilter?.label || "Recent Projects"}
                <ChevronDown className="h-3 w-3" />
              </button>

              {showFilterDropdown && (
                <div className="absolute top-full left-0 z-50 mt-1 min-w-32 rounded-md border border-zinc-800 bg-zinc-900 shadow-lg">
                  {filterOptions.map((option) => (
                    <button
                      key={option.label}
                      onClick={() => {
                        setSelectedFilter(option);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs transition-colors first:rounded-t-md last:rounded-b-md hover:bg-zinc-800 ${
                        selectedFilter?.label === option.label
                          ? "bg-zinc-800 text-zinc-200"
                          : "text-zinc-400"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <SidebarGroupContent className="min-h-0 flex-1">
            <div className="group relative h-full">
              <div className="scrollbar-hide hover:scrollbar-show h-full overflow-y-auto transition-all duration-200">
                <SidebarMenu className="space-y-1 pr-2">
                  {recentProjects.length > 0 ? (
                    recentProjects.map((project) => (
                      <SidebarMenuItem key={project.id}>
                        <SidebarMenuButton
                          asChild
                          className="rounded-lg p-1 transition-all duration-200"
                        >
                          <div className="group flex cursor-pointer items-center gap-3">
                            <div className="min-w-0 flex-1">
                              <Button
                                onClick={() => {
                                  navigate(`/project/${project.id}`);
                                }}
                                variant="ghost"
                                className="truncate p-2 text-sm font-medium text-zinc-200 transition-colors"
                              >
                                {project.title}
                              </Button>
                            </div>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-center">
                      <p className="text-xs text-zinc-500">
                        No projects found (
                        {selectedFilter?.label?.toLowerCase() || "recent"})
                      </p>
                    </div>
                  )}
                </SidebarMenu>
              </div>
              <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-6 bg-gradient-to-t from-zinc-950 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="mx-4 my-4 flex-shrink-0 bg-zinc-800/30" />
      </SidebarContent>
    </Sidebar>
  );
}
