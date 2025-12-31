'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { IconPlus, IconEdit, IconTrash, IconEye, IconEyeOff } from '@tabler/icons-react'
import { ActionDialog } from '@/components/actions/action-dialog'
import { toast } from 'sonner'

interface Action {
  id: string
  name: string
  type: string
  trigger: any
  content: any
  styling: any
  urlPatterns: string[]
  isActive: boolean
  priority: number
  createdAt: string
  _count?: { interactions: number }
}

export default function ActionsPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [actions, setActions] = useState<Action[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAction, setEditingAction] = useState<Action | null>(null)

  const fetchActions = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/actions`)
      if (response.ok) {
        const data = await response.json()
        setActions(data.actions)
      } else {
        toast.error('Failed to load actions')
      }
    } catch (error) {
      toast.error('Failed to load actions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActions()
  }, [projectId])

  const handleCreate = () => {
    setEditingAction(null)
    setDialogOpen(true)
  }

  const handleEdit = (action: Action) => {
    setEditingAction(action)
    setDialogOpen(true)
  }

  const handleDelete = async (actionId: string) => {
    if (!confirm('Are you sure you want to delete this action?')) return

    try {
      const response = await fetch(`/api/projects/${projectId}/actions/${actionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Action deleted successfully')
        fetchActions()
      } else {
        toast.error('Failed to delete action')
      }
    } catch (error) {
      toast.error('Failed to delete action')
    }
  }

  const handleToggleActive = async (action: Action) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/actions/${action.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !action.isActive })
      })


      if (response.ok) {
        toast.success(`Action ${!action.isActive ? 'activated' : 'deactivated'}`)
        fetchActions()
      } else {
        toast.error('Failed to update action')
      }
    } catch (error) {
      toast.error('Failed to update action')
    }
  }

  const getTriggerLabel = (trigger: any) => {
    switch(trigger.type) {
      case 'time':
        return `After ${trigger.delayMs / 1000}s`
      case 'scroll':
        return `Scroll ${trigger.percentage}%`
      case 'exit':
        return 'Exit Intent'
      default:
        return trigger.type
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

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 lg:px-6">
          <div>
            <h1 className="text-3xl font-bold">Engagement Actions</h1>
            <p className="text-muted-foreground">
              Create popups, banners, and modals to engage your visitors
            </p>
          </div>
          <Button onClick={handleCreate}>
            <IconPlus className="h-4 w-4 mr-2" />
            Create Action
          </Button>
        </div>

        {actions.length === 0 ? (
          <Card className="mx-4 lg:mx-6">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No actions created yet</p>
              <Button onClick={handleCreate}>
                <IconPlus className="h-4 w-4 mr-2" />
                Create Your First Action
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 px-4 lg:px-6">
            {actions.map((action) => (
              <Card key={action.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle>{action.name}</CardTitle>
                        <Badge variant={action.isActive ? 'default' : 'secondary'}>
                          {action.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">{action.type}</Badge>
                      </div>
                      <CardDescription>
                        {action.content.title || 'No title'} • {getTriggerLabel(action.trigger)}
                        {action.urlPatterns.length > 0 && (
                          <> • {action.urlPatterns.length} URL pattern(s)</>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(action)}
                      >
                        {action.isActive ? (
                          <IconEyeOff className="h-4 w-4" />
                        ) : (
                          <IconEye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(action)}
                      >
                        <IconEdit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(action.id)}
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Impressions:</span>{' '}
                      <span className="font-medium">
                        {action._count?.interactions || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Priority:</span>{' '}
                      <span className="font-medium">{action.priority}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ActionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        action={editingAction}
        projectId={projectId}
        onSuccess={() => {
          setDialogOpen(false)
          fetchActions()
        }}
      />
    </div>
  )
}
