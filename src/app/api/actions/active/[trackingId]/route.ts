import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/actions/active/[trackingId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackingId: string }> }
) {
  try {
    const { trackingId } = await params

    // Find project
    const project = await prisma.project.findUnique({
      where: { trackingId }
    })

    if (!project) {
      return NextResponse.json({ actions: [] }, { status: 200 })
    }

    // Fetch active actions
    const actions = await prisma.action.findMany({
      where: {
        projectId: project.id,
        isActive: true
      },
      orderBy: { priority: 'desc' },
      select: {
        id: true,
        type: true,
        trigger: true,
        content: true,
        styling: true,
        urlPatterns: true,
        urlMatchType: true,
        priority: true,
      }
    })

    return NextResponse.json({ actions }, {
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        'Access-Control-Allow-Origin': '*',
      }
    })
  } catch (error) {
    console.error('Failed to fetch active actions:', error)
    return NextResponse.json({ actions: [] }, { status: 200 })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}
