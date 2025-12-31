import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const trackActionSchema = z.object({
  actionId: z.string(),
  trackingId: z.string(),
  sessionToken: z.string(),
  type: z.enum(['impression', 'click', 'dismiss', 'conversion']),
  url: z.string(),
})

// POST /api/track-action
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { actionId, trackingId, sessionToken, type, url } = trackActionSchema.parse(body)

    // Validate tracking ID
    const project = await prisma.project.findUnique({
      where: { trackingId }
    })

    if (!project) {
      return new NextResponse(null, { status: 400 })
    }

    // Get session
    const session = await prisma.analyticsSession.findUnique({
      where: { sessionToken }
    })

    if (!session) {
      return new NextResponse(null, { status: 400 })
    }

    // Track interaction
    await prisma.actionInteraction.create({
      data: {
        actionId,
        projectId: project.id,
        sessionId: session.id,
        type,
        url,
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Action tracking error:', error)
    return new NextResponse(null, { status: 500 })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}
