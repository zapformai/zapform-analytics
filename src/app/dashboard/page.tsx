import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { ProjectCard } from '@/components/projects/project-card'
import { CreateProjectDialog } from '@/components/projects/create-project-dialog'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  const projects = await prisma.project.findMany({
    where: {
      userId: session!.user.id
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="flex items-center justify-between px-4 lg:px-6">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-muted-foreground">
              Manage your tracked websites
            </p>
          </div>
          <CreateProjectDialog />
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold">No projects yet</h2>
              <p className="text-muted-foreground max-w-md">
                Create your first project to start tracking analytics on your website
              </p>
              <CreateProjectDialog />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 lg:px-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={{
                  ...project,
                  createdAt: project.createdAt.toISOString()
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
