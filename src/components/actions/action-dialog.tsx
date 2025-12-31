'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

interface ActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: any
  projectId: string
  onSuccess: () => void
}

export function ActionDialog({ open, onOpenChange, action, projectId, onSuccess }: ActionDialogProps) {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'popup',
    triggerType: 'time',
    triggerDelayMs: 3000,
    triggerPercentage: 50,
    triggerSensitivity: 'medium',
    contentTitle: '',
    contentMessage: '',
    contentCtaText: '',
    contentCtaUrl: '',
    contentDismissable: true,
    stylingPosition: 'center',
    stylingWidth: '400px',
    stylingBackgroundColor: '#ffffff',
    stylingTextColor: '#000000',
    stylingButtonColor: '#000000',
    stylingButtonTextColor: '#ffffff',
    stylingBorderRadius: '8px',
    stylingPadding: '24px',
    stylingFontSize: '16px',
    stylingOverlay: true,
    stylingOverlayColor: 'rgba(0,0,0,0.5)',
    stylingAnimation: 'fade',
    urlPatterns: '',
    urlMatchType: 'contains',
    isActive: true,
    priority: 0,
  })

  useEffect(() => {
    if (action) {
      setFormData({
        name: action.name,
        type: action.type,
        triggerType: action.trigger.type,
        triggerDelayMs: action.trigger.delayMs || 3000,
        triggerPercentage: action.trigger.percentage || 50,
        triggerSensitivity: action.trigger.sensitivity || 'medium',
        contentTitle: action.content.title || '',
        contentMessage: action.content.message || '',
        contentCtaText: action.content.ctaText || '',
        contentCtaUrl: action.content.ctaUrl || '',
        contentDismissable: action.content.dismissable !== false,
        stylingPosition: action.styling.position || 'center',
        stylingWidth: action.styling.width || '400px',
        stylingBackgroundColor: action.styling.backgroundColor || '#ffffff',
        stylingTextColor: action.styling.textColor || '#000000',
        stylingButtonColor: action.styling.buttonColor || '#000000',
        stylingButtonTextColor: action.styling.buttonTextColor || '#ffffff',
        stylingBorderRadius: action.styling.borderRadius || '8px',
        stylingPadding: action.styling.padding || '24px',
        stylingFontSize: action.styling.fontSize || '16px',
        stylingOverlay: action.styling.overlay !== false,
        stylingOverlayColor: action.styling.overlayColor || 'rgba(0,0,0,0.5)',
        stylingAnimation: action.styling.animation || 'fade',
        urlPatterns: action.urlPatterns.join('\n'),
        urlMatchType: action.urlMatchType || 'contains',
        isActive: action.isActive,
        priority: action.priority,
      })
    } else {
      setFormData({
        name: '',
        type: 'popup',
        triggerType: 'time',
        triggerDelayMs: 3000,
        triggerPercentage: 50,
        triggerSensitivity: 'medium',
        contentTitle: '',
        contentMessage: '',
        contentCtaText: '',
        contentCtaUrl: '',
        contentDismissable: true,
        stylingPosition: 'center',
        stylingWidth: '400px',
        stylingBackgroundColor: '#ffffff',
        stylingTextColor: '#000000',
        stylingButtonColor: '#000000',
        stylingButtonTextColor: '#ffffff',
        stylingBorderRadius: '8px',
        stylingPadding: '24px',
        stylingFontSize: '16px',
        stylingOverlay: true,
        stylingOverlayColor: 'rgba(0,0,0,0.5)',
        stylingAnimation: 'fade',
        urlPatterns: '',
        urlMatchType: 'contains',
        isActive: true,
        priority: 0,
      })
    }
  }, [action, open])

  const handleSave = async () => {
    if (!formData.name || !formData.contentTitle) {
      toast.error('Please fill in required fields')
      return
    }

    setSaving(true)

    const payload = {
      name: formData.name,
      type: formData.type,
      trigger: {
        type: formData.triggerType,
        delayMs: formData.triggerDelayMs,
        percentage: formData.triggerPercentage,
        sensitivity: formData.triggerSensitivity,
      },
      content: {
        title: formData.contentTitle,
        message: formData.contentMessage,
        ctaText: formData.contentCtaText,
        ctaUrl: formData.contentCtaUrl,
        dismissable: formData.contentDismissable,
      },
      styling: {
        position: formData.stylingPosition,
        width: formData.stylingWidth,
        backgroundColor: formData.stylingBackgroundColor,
        textColor: formData.stylingTextColor,
        buttonColor: formData.stylingButtonColor,
        buttonTextColor: formData.stylingButtonTextColor,
        borderRadius: formData.stylingBorderRadius,
        padding: formData.stylingPadding,
        fontSize: formData.stylingFontSize,
        overlay: formData.stylingOverlay,
        overlayColor: formData.stylingOverlayColor,
        animation: formData.stylingAnimation,
      },
      urlPatterns: formData.urlPatterns.split('\n').filter(p => p.trim()),
      urlMatchType: formData.urlMatchType,
      isActive: formData.isActive,
      priority: formData.priority,
    }

    try {
      const url = action
        ? `/api/projects/${projectId}/actions/${action.id}`
        : `/api/projects/${projectId}/actions`

      const response = await fetch(url, {
        method: action ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const test = await response.json()
      console.log('Toggle active response:', test)

      if (response.ok) {
        toast.success(`Action ${action ? 'updated' : 'created'} successfully`)
        onSuccess()
      } else {
        const data = await response.json()
        toast.error(data.message || 'Failed to save action')
      }
    } catch (error) {
      toast.error('Failed to save action')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{action ? 'Edit Action' : 'Create Action'}</DialogTitle>
          <DialogDescription>
            Configure your engagement action with advanced customization
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="styling">Styling</TabsTrigger>
            <TabsTrigger value="targeting">Targeting</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Action Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Welcome Popup"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Action Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popup">Popup</SelectItem>
                    <SelectItem value="modal">Modal</SelectItem>
                    <SelectItem value="banner">Banner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="triggerType">Trigger Type</Label>
                <Select value={formData.triggerType} onValueChange={(v) => setFormData({ ...formData, triggerType: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="time">Time-based</SelectItem>
                    <SelectItem value="scroll">Scroll-triggered</SelectItem>
                    <SelectItem value="exit">Exit Intent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.triggerType === 'time' && (
              <div className="space-y-2">
                <Label htmlFor="delayMs">Delay (milliseconds)</Label>
                <Input
                  id="delayMs"
                  type="number"
                  value={formData.triggerDelayMs}
                  onChange={(e) => setFormData({ ...formData, triggerDelayMs: parseInt(e.target.value) })}
                />
              </div>
            )}

            {formData.triggerType === 'scroll' && (
              <div className="space-y-2">
                <Label htmlFor="percentage">Scroll Percentage</Label>
                <Input
                  id="percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.triggerPercentage}
                  onChange={(e) => setFormData({ ...formData, triggerPercentage: parseInt(e.target.value) })}
                />
              </div>
            )}

            {formData.triggerType === 'exit' && (
              <div className="space-y-2">
                <Label htmlFor="sensitivity">Exit Sensitivity</Label>
                <Select value={formData.triggerSensitivity} onValueChange={(v) => setFormData({ ...formData, triggerSensitivity: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                />
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contentTitle">Title *</Label>
              <Input
                id="contentTitle"
                value={formData.contentTitle}
                onChange={(e) => setFormData({ ...formData, contentTitle: e.target.value })}
                placeholder="Welcome to our site!"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contentMessage">Message</Label>
              <Textarea
                id="contentMessage"
                value={formData.contentMessage}
                onChange={(e) => setFormData({ ...formData, contentMessage: e.target.value })}
                placeholder="Get 10% off your first purchase!"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contentCtaText">CTA Button Text</Label>
                <Input
                  id="contentCtaText"
                  value={formData.contentCtaText}
                  onChange={(e) => setFormData({ ...formData, contentCtaText: e.target.value })}
                  placeholder="Get Started"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contentCtaUrl">CTA URL</Label>
                <Input
                  id="contentCtaUrl"
                  value={formData.contentCtaUrl}
                  onChange={(e) => setFormData({ ...formData, contentCtaUrl: e.target.value })}
                  placeholder="https://example.com/signup"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="contentDismissable"
                checked={formData.contentDismissable}
                onCheckedChange={(checked) => setFormData({ ...formData, contentDismissable: checked as boolean })}
              />
              <Label htmlFor="contentDismissable">Allow users to dismiss</Label>
            </div>
          </TabsContent>

          <TabsContent value="styling" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stylingPosition">Position</Label>
                <Select value={formData.stylingPosition} onValueChange={(v) => setFormData({ ...formData, stylingPosition: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                    <SelectItem value="top-right">Top Right</SelectItem>
                    <SelectItem value="top-left">Top Left</SelectItem>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stylingWidth">Width</Label>
                <Input
                  id="stylingWidth"
                  value={formData.stylingWidth}
                  onChange={(e) => setFormData({ ...formData, stylingWidth: e.target.value })}
                  placeholder="400px or 80%"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stylingBackgroundColor">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="stylingBackgroundColor"
                    type="color"
                    value={formData.stylingBackgroundColor}
                    onChange={(e) => setFormData({ ...formData, stylingBackgroundColor: e.target.value })}
                    className="w-16"
                  />
                  <Input
                    value={formData.stylingBackgroundColor}
                    onChange={(e) => setFormData({ ...formData, stylingBackgroundColor: e.target.value })}
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stylingTextColor">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="stylingTextColor"
                    type="color"
                    value={formData.stylingTextColor}
                    onChange={(e) => setFormData({ ...formData, stylingTextColor: e.target.value })}
                    className="w-16"
                  />
                  <Input
                    value={formData.stylingTextColor}
                    onChange={(e) => setFormData({ ...formData, stylingTextColor: e.target.value })}
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stylingButtonColor">Button Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="stylingButtonColor"
                    type="color"
                    value={formData.stylingButtonColor}
                    onChange={(e) => setFormData({ ...formData, stylingButtonColor: e.target.value })}
                    className="w-16"
                  />
                  <Input
                    value={formData.stylingButtonColor}
                    onChange={(e) => setFormData({ ...formData, stylingButtonColor: e.target.value })}
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stylingButtonTextColor">Button Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="stylingButtonTextColor"
                    type="color"
                    value={formData.stylingButtonTextColor}
                    onChange={(e) => setFormData({ ...formData, stylingButtonTextColor: e.target.value })}
                    className="w-16"
                  />
                  <Input
                    value={formData.stylingButtonTextColor}
                    onChange={(e) => setFormData({ ...formData, stylingButtonTextColor: e.target.value })}
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stylingBorderRadius">Border Radius</Label>
                <Input
                  id="stylingBorderRadius"
                  value={formData.stylingBorderRadius}
                  onChange={(e) => setFormData({ ...formData, stylingBorderRadius: e.target.value })}
                  placeholder="8px"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stylingPadding">Padding</Label>
                <Input
                  id="stylingPadding"
                  value={formData.stylingPadding}
                  onChange={(e) => setFormData({ ...formData, stylingPadding: e.target.value })}
                  placeholder="24px"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stylingFontSize">Font Size</Label>
                <Input
                  id="stylingFontSize"
                  value={formData.stylingFontSize}
                  onChange={(e) => setFormData({ ...formData, stylingFontSize: e.target.value })}
                  placeholder="16px"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stylingAnimation">Animation</Label>
              <Select value={formData.stylingAnimation} onValueChange={(v) => setFormData({ ...formData, stylingAnimation: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fade">Fade</SelectItem>
                  <SelectItem value="slide">Slide</SelectItem>
                  <SelectItem value="scale">Scale</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="stylingOverlay"
                checked={formData.stylingOverlay}
                onCheckedChange={(checked) => setFormData({ ...formData, stylingOverlay: checked as boolean })}
              />
              <Label htmlFor="stylingOverlay">Show overlay background</Label>
            </div>

            {formData.stylingOverlay && (
              <div className="space-y-2">
                <Label htmlFor="stylingOverlayColor">Overlay Color</Label>
                <Input
                  id="stylingOverlayColor"
                  value={formData.stylingOverlayColor}
                  onChange={(e) => setFormData({ ...formData, stylingOverlayColor: e.target.value })}
                  placeholder="rgba(0,0,0,0.5)"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="targeting" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="urlPatterns">URL Patterns (one per line)</Label>
              <Textarea
                id="urlPatterns"
                value={formData.urlPatterns}
                onChange={(e) => setFormData({ ...formData, urlPatterns: e.target.value })}
                placeholder={"/pricing\n/blog/*\n*/checkout"}
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to show on all pages. Use * as wildcard.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urlMatchType">URL Match Type</Label>
              <Select value={formData.urlMatchType} onValueChange={(v) => setFormData({ ...formData, urlMatchType: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exact">Exact Match</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="startsWith">Starts With</SelectItem>
                  <SelectItem value="regex">Regular Expression</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : action ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
