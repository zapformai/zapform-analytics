'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { IconChartBar, IconSettings, IconWorld } from '@tabler/icons-react'
import { formatDistanceToNow } from 'date-fns'

interface ProjectCardProps {
  project: {
    id: string
    name: string
    domain: string
    trackingId: string
    createdAt: string
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle>{project.name}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <IconWorld className="h-3 w-3" />
              {project.domain}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="font-mono text-xs">
            {project.trackingId.substring(0, 8)}...
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
        </p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button asChild className="flex-1">
          <Link href={`/dashboard/${project.id}`}>
            <IconChartBar className="mr-2 h-4 w-4" />
            View Analytics
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/dashboard/${project.id}/settings`}>
            <IconSettings className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
