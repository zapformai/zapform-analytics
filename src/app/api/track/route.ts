import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { detectDevice } from '@/lib/tracking/device-detector'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, trackingId, sessionToken, ...data } = body

    // Validate tracking ID
    const project = await prisma.project.findUnique({
      where: { trackingId }
    })

    if (!project) {
      return new NextResponse(null, { status: 400 })
    }

    // Get or create analytics session
    let session = await prisma.analyticsSession.findUnique({
      where: { sessionToken }
    })

    if (!session) {
      // Create new session
      const deviceInfo = data.deviceInfo || {}
      const ipAddress = request.headers.get('x-forwarded-for') ||
                        request.headers.get('x-real-ip') ||
                        'unknown'

      // Detect device from user agent if not provided
      const userAgent = request.headers.get('user-agent') || ''
      const detectedDevice = detectDevice(userAgent)

      session = await prisma.analyticsSession.create({
        data: {
          projectId: project.id,
          sessionToken,
          browser: deviceInfo.browser || detectedDevice.browser,
          browserVersion: deviceInfo.browserVersion || detectedDevice.browserVersion,
          os: deviceInfo.os || detectedDevice.os,
          osVersion: deviceInfo.osVersion || detectedDevice.osVersion,
          deviceType: deviceInfo.deviceType || detectedDevice.deviceType,
          screenWidth: deviceInfo.screenWidth,
          screenHeight: deviceInfo.screenHeight,
          ipAddress,
        }
      })
    } else {
      // Update last activity
      await prisma.analyticsSession.update({
        where: { id: session.id },
        data: {
          lastActivity: new Date(),
          duration: Math.floor((Date.now() - session.startTime.getTime()) / 1000)
        }
      })
    }

    // Store event based on type
    switch (type) {
      case 'pageview':
      case 'session_start':
        await prisma.pageView.create({
          data: {
            projectId: project.id,
            sessionId: session.id,
            url: data.url,
            referrer: data.referrer,
          }
        })
        break

      case 'click':
        await prisma.clickEvent.create({
          data: {
            projectId: project.id,
            sessionId: session.id,
            url: data.url,
            elementSelector: data.elementSelector,
            elementText: data.elementText,
            xCoordinate: data.xCoordinate,
            yCoordinate: data.yCoordinate,
          }
        })
        break

      case 'scroll':
        await prisma.scrollEvent.create({
          data: {
            projectId: project.id,
            sessionId: session.id,
            url: data.url,
            scrollDepth: data.scrollDepth,
            maxScroll: data.maxScroll,
          }
        })
        break
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Tracking error:', error)
    return new NextResponse(null, { status: 500 })
  }
}

// Handle OPTIONS for CORS preflight
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
