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

const updateActionSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['popup', 'banner', 'modal']).optional(),
  trigger: triggerSchema.optional(),
  content: contentSchema.optional(),
  styling: stylingSchema.optional(),
  urlPatterns: z.array(z.string()).optional(),
  urlMatchType: z.enum(['exact', 'contains', 'startsWith', 'regex']).optional(),
  isActive: z.boolean().optional(),
  priority: z.number().optional(),
})

// GET /api/projects/[projectId]/actions/[actionId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; actionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, actionId } = await params

    const action = await prisma.action.findFirst({
      where: {
        id: actionId,
        projectId,
        project: { userId: session.user.id }
      }
    })

    if (!action) {
      return NextResponse.json({ message: 'Action not found' }, { status: 404 })
    }

    return NextResponse.json({ action })
  } catch (error) {
    console.error('Failed to fetch action:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/projects/[projectId]/actions/[actionId]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; actionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, actionId } = await params

    // Verify ownership
    const existingAction = await prisma.action.findFirst({
      where: {
        id: actionId,
        projectId,
        project: { userId: session.user.id }
      }
    })

    if (!existingAction) {
      return NextResponse.json({ message: 'Action not found' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = updateActionSchema.parse(body)

    const action = await prisma.action.update({
      where: { id: actionId },
      data: validatedData
    })

    return NextResponse.json({ message: 'Action updated successfully', action })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 })
    }
    console.error('Failed to update action:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/projects/[projectId]/actions/[actionId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; actionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, actionId } = await params

    const existingAction = await prisma.action.findFirst({
      where: {
        id: actionId,
        projectId,
        project: { userId: session.user.id }
      }
    })

    if (!existingAction) {
      return NextResponse.json({ message: 'Action not found' }, { status: 404 })
    }

    await prisma.action.delete({ where: { id: actionId } })

    return NextResponse.json({ message: 'Action deleted successfully' })
  } catch (error) {
    console.error('Failed to delete action:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
