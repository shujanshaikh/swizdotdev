"use client"

import { Calendar, FileText, Globe, MessageSquare, Settings, Plus, PanelLeftClose } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "~/components/ui/sidebar"

// Mock data for projects
const projects = [
  {
    id: 1,
    name: "Personal CRM",
    type: "Web App",
    icon: FileText,
    lastModified: "2 hours ago",
    status: "active",
  },
  {
    id: 2,
    name: "Task Manager",
    type: "Dashboard",
    icon: Calendar,
    lastModified: "1 day ago",
    status: "completed",
  },
  {
    id: 3,
    name: "Blog Platform",
    type: "Website",
    icon: Globe,
    lastModified: "3 days ago",
    status: "draft",
  },
  {
    id: 4,
    name: "Chat Application",
    type: "Real-time App",
    icon: MessageSquare,
    lastModified: "1 week ago",
    status: "active",
  },
]

const recentProjects = projects.slice(0, 3)

export default function SidebarComponent() {
  const { toggleSidebar } = useSidebar()
  
  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon" className="border-r border-zinc-800 bg-zinc-900 overflow-hidden">
      <SidebarHeader className="bg-zinc-900 py-4 px-4">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-2xl font-semibold text-white tracking-widest items-center justify-center flex font-mono">
            swizdotdev
          </h1>
          <button 
            onClick={toggleSidebar}
            className="p-1 hover:bg-zinc-800/50 rounded transition-colors"
          >
            <PanelLeftClose className="h-4 w-4 text-zinc-400 hover:text-white" />
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-zinc-900 overflow-hidden">
        <SidebarGroup>
          <SidebarGroupLabel className="text-zinc-400">Recent Projects</SidebarGroupLabel>
          <SidebarGroupAction className="text-zinc-400 hover:text-white hover:bg-zinc-800">
            <Plus className="h-4 w-4" />
            <span className="sr-only">New Project</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {recentProjects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton asChild className="hover:bg-zinc-800">
                    <div className="flex items-center gap-2 cursor-pointer">
                      <project.icon className="h-4 w-4 text-zinc-400" />
                      <div className="flex-1 min-w-0">
                        <span className="truncate text-white">{project.name}</span>
                        <div className="text-xs text-zinc-500">{project.lastModified}</div>
                      </div>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-zinc-800" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-zinc-400">All Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton asChild className="hover:bg-zinc-800">
                    <div className="flex items-center gap-2 cursor-pointer">
                      <project.icon className="h-4 w-4 text-zinc-400" />
                      <div className="flex-1 min-w-0">
                        <span className="truncate text-white">{project.name}</span>
                        <div className="text-xs text-zinc-500">
                          {project.type} • {project.lastModified}
                        </div>
                      </div>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-zinc-800 bg-zinc-900">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="hover:bg-zinc-800">
              <div className="flex items-center gap-2 cursor-pointer">
                <Settings className="h-4 w-4 text-zinc-400" />
                <span className="text-white">Settings</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
