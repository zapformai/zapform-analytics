'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import { toast } from 'sonner'

interface TrackingCodeSnippetProps {
  trackingId: string
}

export function TrackingCodeSnippet({ trackingId }: TrackingCodeSnippetProps) {
  const [copiedTab, setCopiedTab] = useState<string | null>(null)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'

  const snippets = {
    nextjs: `import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* ZapForm Analytics Tracking Script */}
        <Script
          src="${baseUrl}/api/tracking-script/${trackingId}"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  )
}`,
    react: `// Add to your main App.js or index.html
import { useEffect } from 'react'

function App() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = '${baseUrl}/api/tracking-script/${trackingId}'
    script.async = true
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  return (
    // your app
  )
}`,
    html: `<!-- Add this to the <head> section of your HTML -->
<script async src="${baseUrl}/api/tracking-script/${trackingId}"></script>`,
    webflow: `1. Go to your Webflow project settings
2. Navigate to the 'Custom Code' tab
3. In the 'Head Code' section, paste:

<script async src="${baseUrl}/api/tracking-script/${trackingId}"></script>

4. Publish your site`,
    wordpress: `1. Install a plugin like 'Insert Headers and Footers' or 'WPCode'
2. Go to the plugin settings
3. In the 'Header' section, paste:

<script async src="${baseUrl}/api/tracking-script/${trackingId}"></script>

4. Save changes

Alternative: Add directly to theme's header.php before </head>`,
  }

  const copyToClipboard = async (code: string, tab: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedTab(tab)
      toast.success('Code copied to clipboard!')
      setTimeout(() => setCopiedTab(null), 2000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tracking Code</CardTitle>
        <CardDescription>
          Choose your platform and add the tracking code to your website
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="html" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="nextjs">Next.js</TabsTrigger>
            <TabsTrigger value="react">React</TabsTrigger>
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="webflow">Webflow</TabsTrigger>
            <TabsTrigger value="wordpress">WordPress</TabsTrigger>
          </TabsList>

          {Object.entries(snippets).map(([key, code]) => (
            <TabsContent key={key} value={key} className="space-y-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code className="whitespace-pre-wrap">{code}</code>
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(code, key)}
                >
                  {copiedTab === key ? (
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

              {key === 'nextjs' && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Installation:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Add the Script component to your root layout.tsx</li>
                    <li>Replace children with your existing content</li>
                    <li>The script will load after the page is interactive</li>
                  </ol>
                </div>
              )}

              {key === 'react' && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Installation:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Add the useEffect hook to your main App component</li>
                    <li>Or add the script tag directly to your index.html</li>
                    <li>The script will load when the component mounts</li>
                  </ol>
                </div>
              )}

              {key === 'html' && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Installation:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Copy the script tag above</li>
                    <li>Paste it in the {`<head>`} section of your HTML</li>
                    <li>Deploy your changes and test</li>
                  </ol>
                </div>
              )}

              {key === 'webflow' && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Note:</h4>
                  <p className="text-sm text-muted-foreground">
                    Custom code is available on Webflow&apos;s paid plans. The script will be added to all pages automatically.
                  </p>
                </div>
              )}

              {key === 'wordpress' && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Recommended Plugins:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Insert Headers and Footers (Free)</li>
                    <li>WPCode (Free)</li>
                    <li>Head, Footer and Post Injections (Free)</li>
                  </ul>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">What gets tracked:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✓ Page views with referrer information</li>
            <li>✓ User clicks on buttons and links</li>
            <li>✓ Scroll depth on each page</li>
            <li>✓ Device type, browser, and OS</li>
            <li>✓ Session duration and unique visitors</li>
            <li>✓ Engagement actions (popups, banners, modals)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
