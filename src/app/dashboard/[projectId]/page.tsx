'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { IconRefresh, IconTrendingUp, IconTrendingDown, IconMinus } from '@tabler/icons-react'
import { toast } from 'sonner'

interface AnalyticsData {
  overview: {
    totalPageViews: number
    uniqueVisitors: number
    avgSessionDuration: number
    bounceRate: number
  }
  topPages: Array<{ url: string; views: number }>
  deviceBreakdown: Array<{ deviceType: string; count: number }>
  browserBreakdown: Array<{ browser: string; count: number }>
  topClicks: Array<{ elementSelector: string; elementText: string | null; count: number }>
  scrollDepthByPage: Array<{ url: string; avgScrollDepth: number }>
  pageViewsByDay: Array<{ date: string; count: number }>
}

export default function AnalyticsDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(7)

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics/${projectId}?days=${days}`)

      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Project not found')
          router.push('/dashboard')
          return
        }
        throw new Error('Failed to fetch analytics')
      }

      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (error) {
      toast.error('Failed to load analytics')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [projectId, days])

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  if (loading || !data) {
    return (
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 lg:px-6">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">
              Last {days} days
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={days === 7 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDays(7)}
            >
              7 days
            </Button>
            <Button
              variant={days === 30 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDays(30)}
            >
              30 days
            </Button>
            <Button
              variant={days === 90 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDays(90)}
            >
              90 days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAnalytics}
            >
              <IconRefresh className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 lg:px-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Page Views</CardDescription>
              <CardTitle className="text-3xl">{data.overview.totalPageViews.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Unique Visitors</CardDescription>
              <CardTitle className="text-3xl">{data.overview.uniqueVisitors.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg Session Duration</CardDescription>
              <CardTitle className="text-3xl">{formatDuration(data.overview.avgSessionDuration)}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Bounce Rate</CardDescription>
              <CardTitle className="text-3xl">{data.overview.bounceRate}%</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Top Pages */}
        <Card className="mx-4 lg:mx-6">
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <CardDescription>Most visited pages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topPages.length === 0 ? (
                <p className="text-sm text-muted-foreground">No page views yet</p>
              ) : (
                data.topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{page.url}</p>
                    </div>
                    <Badge variant="secondary">{page.views} views</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Device & Browser Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
              <CardDescription>Visitors by device type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.deviceBreakdown.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No device data yet</p>
                ) : (
                  data.deviceBreakdown.map((device, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{device.deviceType}</span>
                      <Badge variant="secondary">{device.count}</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Browser Breakdown</CardTitle>
              <CardDescription>Visitors by browser</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.browserBreakdown.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No browser data yet</p>
                ) : (
                  data.browserBreakdown.map((browser, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{browser.browser}</span>
                      <Badge variant="secondary">{browser.count}</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Clicks */}
        <Card className="mx-4 lg:mx-6">
          <CardHeader>
            <CardTitle>Most Clicked Elements</CardTitle>
            <CardDescription>Top clicked buttons and links</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topClicks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No click data yet</p>
              ) : (
                data.topClicks.map((click, index) => (
                  <div key={index} className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium font-mono">{click.elementSelector}</p>
                      {click.elementText && (
                        <p className="text-xs text-muted-foreground truncate">{click.elementText}</p>
                      )}
                    </div>
                    <Badge variant="secondary">{click.count} clicks</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Scroll Depth */}
        <Card className="mx-4 lg:mx-6">
          <CardHeader>
            <CardTitle>Average Scroll Depth</CardTitle>
            <CardDescription>How far visitors scroll on each page</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.scrollDepthByPage.length === 0 ? (
                <p className="text-sm text-muted-foreground">No scroll data yet</p>
              ) : (
                data.scrollDepthByPage.map((scroll, index) => (
                  <div key={index} className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{scroll.url}</p>
                    </div>
                    <Badge variant="secondary">{scroll.avgScrollDepth}%</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
