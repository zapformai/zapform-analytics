'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrackingCodeSnippet } from '@/components/projects/tracking-code-snippet'
import { IconTrash } from '@tabler/icons-react'
import { toast } from 'sonner'

interface Project {
  id: string
  name: string
  domain: string
  trackingId: string
}

export default function ProjectSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')

  useEffect(() => {
    fetchProject()
  }, [projectId])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)

      if (!response.ok) {
        toast.error('Project not found')
        router.push('/dashboard')
        return
      }

      const data = await response.json()
      setProject(data.project)
      setName(data.project.name)
      setDomain(data.project.domain)
    } catch (error) {
      toast.error('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, domain }),
      })

      if (!response.ok) {
        throw new Error('Failed to update project')
      }

      toast.success('Project updated successfully!')
      fetchProject()
    } catch (error) {
      toast.error('Failed to update project')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? All analytics data will be permanently deleted.')) {
      return
    }

    setDeleting(true)

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete project')
      }

      toast.success('Project deleted successfully')
      router.push('/dashboard')
    } catch (error) {
      toast.error('Failed to delete project')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (!project) {
    return null
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <h1 className="text-3xl font-bold">Project Settings</h1>
          <p className="text-muted-foreground">
            Manage your project configuration and tracking code
          </p>
        </div>

        <div className="space-y-6 px-4 lg:px-6">
          {/* Tracking Code */}
          <TrackingCodeSnippet trackingId={project.trackingId} />

          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Update your project information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Input
                    id="domain"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    required
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trackingId">Tracking ID</Label>
                  <Input
                    id="trackingId"
                    value={project.trackingId}
                    disabled
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    This ID cannot be changed
                  </p>
                </div>

                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions that affect your project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Delete Project</h4>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete this project and all associated analytics data
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <IconTrash className="h-4 w-4 mr-2" />
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
