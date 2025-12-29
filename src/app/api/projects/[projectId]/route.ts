import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').optional(),
  domain: z.string().min(1, 'Domain is required').optional(),
})

// GET /api/projects/[projectId] - Get a specific project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { projectId } = await params

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      },
      select: {
        id: true,
        name: true,
        domain: true,
        trackingId: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!project) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Failed to fetch project:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/projects/[projectId] - Update a project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { projectId } = await params

    // Check if project exists and belongs to user
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      }
    })

    if (!existingProject) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = updateProjectSchema.parse(body)

    const project = await prisma.project.update({
      where: {
        id: projectId
      },
      data: validatedData,
      select: {
        id: true,
        name: true,
        domain: true,
        trackingId: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json(
      { message: 'Project updated successfully', project }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Failed to update project:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[projectId] - Delete a project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { projectId } = await params

    // Check if project exists and belongs to user
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      }
    })

    if (!existingProject) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      )
    }

    // Delete project (cascade will delete all related analytics data)
    await prisma.project.delete({
      where: {
        id: projectId
      }
    })

    return NextResponse.json(
      { message: 'Project deleted successfully' }
    )
  } catch (error) {
    console.error('Failed to delete project:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
