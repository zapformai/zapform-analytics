'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import { toast } from 'sonner'

interface TrackingCodeSnippetProps {
  trackingId: string
}

export function TrackingCodeSnippet({ trackingId }: TrackingCodeSnippetProps) {
  const [copied, setCopied] = useState(false)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  const trackingCode = `<script async src="${baseUrl}/api/tracking-script/${trackingId}"></script>`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(trackingCode)
      setCopied(true)
      toast.success('Tracking code copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tracking Code</CardTitle>
        <CardDescription>
          Add this code to the {`<head>`} section of your website
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
            <code>{trackingCode}</code>
          </pre>
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-2 right-2"
            onClick={copyToClipboard}
          >
            {copied ? (
              <>
                <IconCheck className="h-4 w-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <IconCopy className="h-4 w-4 mr-2" />
                Copy
              </>
            )}
          </Button>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Installation Instructions:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>Copy the tracking code above</li>
            <li>Paste it in the {`<head>`} section of your HTML</li>
            <li>Deploy your changes</li>
            <li>Visit your website to test tracking</li>
            <li>Return here to view analytics</li>
          </ol>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">What gets tracked:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✓ Page views with referrer information</li>
            <li>✓ User clicks on buttons and links</li>
            <li>✓ Scroll depth on each page</li>
            <li>✓ Device type, browser, and OS</li>
            <li>✓ Session duration and unique visitors</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
