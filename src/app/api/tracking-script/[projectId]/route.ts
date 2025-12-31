import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { trackingScriptTemplate } from '@/lib/tracking/tracking-script-template'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params

    // Find project by tracking ID
    const project = await prisma.project.findUnique({
      where: { trackingId: projectId }
    })

    if (!project) {
      return new NextResponse('// Project not found', {
        status: 404,
        headers: {
          'Content-Type': 'application/javascript',
        }
      })
    }

    // Get the base URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    // Replace placeholders in template
    const script = trackingScriptTemplate
      .replaceAll('__TRACKING_ID__', project.trackingId)
      .replaceAll('__API_ENDPOINT__', baseUrl)

    return new NextResponse(script, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*', // Allow from any origin
      }
    })
  } catch (error) {
    console.error('Failed to serve tracking script:', error)
    return new NextResponse('// Error loading tracking script', {
      status: 500,
      headers: {
        'Content-Type': 'application/javascript',
      }
    })
  }
}
