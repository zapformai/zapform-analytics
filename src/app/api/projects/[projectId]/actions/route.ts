import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schemas
const triggerSchema = z.object({
  type: z.enum(['time', 'scroll', 'exit']),
  delayMs: z.number().optional(),
  percentage: z.number().min(0).max(100).optional(),
  sensitivity: z.enum(['low', 'medium', 'high']).optional(),
})

const contentSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  ctaText: z.string().optional(),
  ctaUrl: z.string().url().optional().or(z.literal('')),
  dismissable: z.boolean().default(true),
})

const stylingSchema = z.object({
  position: z.string().default('center'),
  width: z.string().default('400px'),
  height: z.string().optional(),
  backgroundColor: z.string().default('#ffffff'),
  textColor: z.string().default('#000000'),
  buttonColor: z.string().default('#000000'),
  buttonTextColor: z.string().default('#ffffff'),
  borderRadius: z.string().default('8px'),
  padding: z.string().default('24px'),
  fontSize: z.string().default('16px'),
  fontFamily: z.string().optional(),
  overlay: z.boolean().default(true),
  overlayColor: z.string().default('rgba(0,0,0,0.5)'),
  animation: z.enum(['fade', 'slide', 'scale']).default('fade'),
})

const createActionSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['popup', 'banner', 'modal']),
  trigger: triggerSchema,
  content: contentSchema,
  styling: stylingSchema,
  urlPatterns: z.array(z.string()).default([]),
  urlMatchType: z.enum(['exact', 'contains', 'startsWith', 'regex']).default('contains'),
  isActive: z.boolean().default(true),
  priority: z.number().default(0),
})

// GET /api/projects/[projectId]/actions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = await params

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: session.user.id }
    })

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 })
    }

    // Fetch all actions with interaction counts
    const actions = await prisma.action.findMany({
      where: { projectId },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        name: true,
        type: true,
        trigger: true,
        content: true,
        styling: true,
        urlPatterns: true,
        urlMatchType: true,
        isActive: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            interactions: {
              where: { type: 'impression' }
            }
          }
        }
      }
    })

    return NextResponse.json({ actions })
  } catch (error) {
    console.error('Failed to fetch actions:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/projects/[projectId]/actions
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = await params

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: session.user.id }
    })

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = createActionSchema.parse(body)

    const action = await prisma.action.create({
      data: {
        projectId,
        ...validatedData,
      }
    })

    return NextResponse.json(
      { message: 'Action created successfully', action },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('Failed to create action:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
