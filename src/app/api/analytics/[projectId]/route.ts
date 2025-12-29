import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { subDays, startOfDay, endOfDay } from 'date-fns'

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

    // Await params in Next.js 15
    const { projectId } = await params

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      )
    }

    // Get query parameters for date range
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '7')
    const startDate = startOfDay(subDays(new Date(), days))
    const endDate = endOfDay(new Date())

    // Get total page views
    const totalPageViews = await prisma.pageView.count({
      where: {
        projectId: projectId,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    // Get unique visitors (unique sessions)
    const uniqueVisitors = await prisma.analyticsSession.count({
      where: {
        projectId: projectId,
        startTime: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    // Get average session duration
    const avgDuration = await prisma.analyticsSession.aggregate({
      where: {
        projectId: projectId,
        startTime: {
          gte: startDate,
          lte: endDate
        }
      },
      _avg: {
        duration: true
      }
    })

    // Get top pages
    const topPages = await prisma.pageView.groupBy({
      by: ['url'],
      where: {
        projectId: projectId,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        url: true
      },
      orderBy: {
        _count: {
          url: 'desc'
        }
      },
      take: 10
    })

    // Get device breakdown
    const deviceBreakdown = await prisma.analyticsSession.groupBy({
      by: ['deviceType'],
      where: {
        projectId: projectId,
        startTime: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        deviceType: true
      }
    })

    // Get browser breakdown
    const browserBreakdown = await prisma.analyticsSession.groupBy({
      by: ['browser'],
      where: {
        projectId: projectId,
        startTime: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        browser: true
      },
      orderBy: {
        _count: {
          browser: 'desc'
        }
      },
      take: 5
    })

    // Get top clicked elements
    const topClicks = await prisma.clickEvent.groupBy({
      by: ['elementSelector', 'elementText'],
      where: {
        projectId: projectId,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        elementSelector: true
      },
      orderBy: {
        _count: {
          elementSelector: 'desc'
        }
      },
      take: 10
    })

    // Get average scroll depth by page
    const scrollDepthByPage = await prisma.scrollEvent.groupBy({
      by: ['url'],
      where: {
        projectId: projectId,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      _avg: {
        maxScroll: true
      },
      orderBy: {
        _avg: {
          maxScroll: 'desc'
        }
      },
      take: 10
    })

    // Get page views over time (daily) - use Prisma groupBy instead of raw SQL
    const pageViewsByDay = await prisma.pageView.groupBy({
      by: ['timestamp'],
      where: {
        projectId: projectId,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        id: true
      }
    })

    return NextResponse.json({
      overview: {
        totalPageViews,
        uniqueVisitors,
        avgSessionDuration: Math.round(avgDuration._avg.duration || 0),
        bounceRate: uniqueVisitors > 0 ? Math.round((1 - (totalPageViews / uniqueVisitors)) * 100) : 0
      },
      topPages: topPages.map(p => ({
        url: p.url,
        views: p._count.url
      })),
      deviceBreakdown: deviceBreakdown.map(d => ({
        deviceType: d.deviceType || 'Unknown',
        count: d._count.deviceType
      })),
      browserBreakdown: browserBreakdown.map(b => ({
        browser: b.browser || 'Unknown',
        count: b._count.browser
      })),
      topClicks: topClicks.map(c => ({
        elementSelector: c.elementSelector,
        elementText: c.elementText,
        count: c._count.elementSelector
      })),
      scrollDepthByPage: scrollDepthByPage.map(s => ({
        url: s.url,
        avgScrollDepth: Math.round(s._avg.maxScroll || 0)
      })),
      pageViewsByDay: [] // Simplified - can be enhanced later with proper date grouping
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
