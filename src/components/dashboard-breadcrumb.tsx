'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface Project {
  id: string
  name: string
}

export function DashboardBreadcrumb() {
  const pathname = usePathname()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(false)

  // Extract project ID from pathname
  const projectIdMatch = pathname.match(/\/dashboard\/([^\/]+)/)
  const projectId = projectIdMatch ? projectIdMatch[1] : null

  useEffect(() => {
    if (projectId && projectId !== 'undefined') {
      setLoading(true)
      fetch(`/api/projects/${projectId}`)
        .then(res => res.json())
        .then(data => {
          if (data.project) {
            setProject(data.project)
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    } else {
      setProject(null)
    }
  }, [projectId])

  // Determine current page
  const isSettingsPage = pathname.includes('/settings')
  const isProjectAnalytics = projectId && !isSettingsPage
  const isDashboardHome = pathname === '/dashboard'

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {isDashboardHome && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>All Projects</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}

        {projectId && project && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {isSettingsPage ? (
                <BreadcrumbLink asChild>
                  <Link href={`/dashboard/${projectId}`}>{project.name}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{project.name}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </>
        )}

        {projectId && loading && !project && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Loading...</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}

        {isProjectAnalytics && project && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Analytics</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}

        {isSettingsPage && project && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
