"use client"

import * as React from "react"
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  IconChartBar,
  IconFolder,
  IconSettings,
  IconChevronDown,
  IconLocation,
} from "@tabler/icons-react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface Project {
  id: string
  name: string
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [projects, setProjects] = React.useState<Project[]>([])
  const [loading, setLoading] = React.useState(true)
  const [openProjects, setOpenProjects] = React.useState<Set<string>>(new Set())

  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects')
        if (response.ok) {
          const data = await response.json()
          setProjects(data.projects)
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchProjects()
    }
  }, [session])

  // Auto-expand project when navigating to it
  React.useEffect(() => {
    const projectIdMatch = pathname.match(/\/dashboard\/([^\/]+)/)
    const currentProjectId = projectIdMatch ? projectIdMatch[1] : null

    if (currentProjectId) {
      setOpenProjects(prev => {
        const newSet = new Set(prev)
        newSet.add(currentProjectId)
        return newSet
      })
    }
  }, [pathname])

  const user = {
    name: session?.user?.name || "User",
    email: session?.user?.email || "",
    avatar: session?.user?.image || "",
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg ">
                  <img src="/zapform_logo.svg" alt="" />
                </div>
                <span className="text-base font-semibold">ZapForm Analytics</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/dashboard'}
                  tooltip="All Projects"
                >
                  <Link href="/dashboard">
                    <IconFolder />
                    <span>All Projects</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!loading && projects.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {projects.map((project) => {
                  const isProjectActive = pathname.includes(`/dashboard/${project.id}`)
                  const isOpen = openProjects.has(project.id)

                  return (
                    <Collapsible
                      key={project.id}
                      open={isOpen}
                      onOpenChange={(open) => {
                        setOpenProjects(prev => {
                          const newSet = new Set(prev)
                          if (open) {
                            newSet.add(project.id)
                          } else {
                            newSet.delete(project.id)
                          }
                          return newSet
                        })
                      }}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={project.name}>
                            <IconFolder />
                            <span className="truncate">{project.name}</span>
                            <IconChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === `/dashboard/${project.id}`}
                              >
                                <Link href={`/dashboard/${project.id}`}>
                                  <IconChartBar />
                                  <span>Analytics</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === `/dashboard/${project.id}/actions`}
                              >
                                <Link href={`/dashboard/${project.id}/actions`}>
                                  <IconLocation />
                                  <span>Actions</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === `/dashboard/${project.id}/settings`}
                              >
                                <Link href={`/dashboard/${project.id}/settings`}>
                                  <IconSettings />
                                  <span>Settings</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
