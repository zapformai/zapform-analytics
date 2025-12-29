import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  domain: z.string().min(1, 'Domain is required'),
})

// GET /api/projects - List all projects for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
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

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createProjectSchema.parse(body)

    const project = await prisma.project.create({
      data: {
        name: validatedData.name,
        domain: validatedData.domain,
        userId: session.user.id,
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

    return NextResponse.json(
      { message: 'Project created successfully', project },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Failed to create project:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
