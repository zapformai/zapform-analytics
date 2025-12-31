This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


Overview

     Add website engagement actions (popups, banners, modals) to ZapForm Analytics with:
     - Action Types: Time-based popup, scroll-triggered popup, exit-intent popup, custom banners
     - Customization: Advanced - full control over colors, position, size, styling
     - Analytics: Track impressions, clicks, dismissals, conversions with CTR metrics
     - Targeting: URL-based pattern matching (exact, contains, startsWith, regex)

     Implementation Phases

     Phase 1: Database Schema (Priority: Critical)

     File: prisma/schema.prisma

     Add two new models:

     1. Action Model - Stores action configurations
       - Fields: name, type, trigger (JSON), content (JSON), styling (JSON), urlPatterns[], urlMatchType, isActive,      
     priority
       - Relations: belongs to Project, has many ActionInteractions
       - Indexes: [projectId, isActive], [projectId, priority]
     2. ActionInteraction Model - Tracks engagement metrics
       - Fields: actionId, projectId, sessionId, type (impression/click/dismiss/conversion), url, timestamp
       - Relations: belongs to Action, Project, AnalyticsSession
       - Indexes: [actionId, type, timestamp], [projectId, timestamp], [sessionId]

     Update existing models:
     - Add actions and actionInteractions relations to Project model
     - Add actionInteractions relation to AnalyticsSession model

     Migration:
     npx prisma migrate dev --name add_engagement_actions
     npx prisma generate

     Phase 2: API Endpoints

     2.1 Protected CRUD Endpoints

     File: src/app/api/projects/[projectId]/actions/route.ts
     - GET - List all actions for project (with interaction counts)
     - POST - Create new action (Zod validation for all fields)

     File: src/app/api/projects/[projectId]/actions/[actionId]/route.ts
     - GET - Get single action
     - PUT - Update action
     - DELETE - Delete action (cascade interactions)

     File: src/app/api/projects/[projectId]/actions/[actionId]/analytics/route.ts
     - GET - Get action performance metrics (impressions, clicks, CTR, timeline)

     2.2 Public Endpoints (No Auth)

     File: src/app/api/actions/active/[trackingId]/route.ts
     - GET - Fetch active actions for tracking script
     - CORS enabled, 5-minute cache
     - Returns only: id, type, trigger, content, styling, urlPatterns, urlMatchType, priority

     File: src/app/api/track-action/route.ts
     - POST - Track action interactions (impression/click/dismiss/conversion)
     - CORS enabled
     - Validates trackingId and sessionToken

     Phase 3: Tracking Script Updates

     File: src/lib/tracking/tracking-script-template.ts

     Add Engagement Actions Module (after scroll tracking, before init()):

     Core Functions:
     1. fetchActions() - Fetch active actions from API
     2. shouldDisplayAction(action) - Check URL patterns and display rules
     3. matchesUrlPattern(pattern, url, matchType) - URL matching logic (exact/contains/startsWith/regex)
     4. createActionElement(action) - Render modal/popup/banner DOM
     5. trackAction(actionId, type) - Send interaction events to API
     6. displayAction(action) - Show action with animation
     7. closeAction(actionId) - Remove action from DOM

     Trigger Handlers:
     - setupTimeTrigger(action) - setTimeout based on delayMs
     - setupScrollTrigger(action) - Monitor scroll percentage
     - setupExitIntentTrigger(action) - Mouse movement detection

     Rendering:
     - Dynamic styles from configuration
     - Position handling (center, top, bottom, corners)
     - Overlay with dismissal
     - CTA button with tracking
     - Animations (fade/slide/scale)
     - XSS protection with escapeHtml()

     Update init() to call fetchActions() on load.

     Phase 4: UI Components

     4.1 Actions Management Page

     File: src/app/dashboard/[projectId]/actions/page.tsx

     Features:
     - List all actions with status badges (Active/Inactive)
     - Display action type, trigger, URL patterns
     - Quick toggle active/inactive
     - Edit/delete buttons
     - Create new action button
     - Show impression counts

     4.2 Action Dialog (Create/Edit)

     File: src/components/actions/action-dialog.tsx

     Tabbed interface with 4 sections:

     Tab 1: Basic
     - Name, Type (popup/modal/banner)
     - Trigger type selection (time/scroll/exit)
     - Trigger configuration (delay, percentage, sensitivity)
     - Priority and Active toggle

     Tab 2: Content
     - Title (required)
     - Message (textarea)
     - CTA button text and URL
     - Dismissable checkbox

     Tab 3: Styling (Advanced)
     - Position selector (7 options)
     - Width input
     - Color pickers: Background, Text, Button, Button Text
     - Border radius, Padding, Font size
     - Animation selector (fade/slide/scale)
     - Overlay toggle and color
     - All fields use both color picker and text input

     Tab 4: Targeting
     - URL patterns (textarea, one per line)
     - Match type selector (exact/contains/startsWith/regex)
     - Help text for wildcards

     4.3 Navigation Updates

     File: src/components/app-sidebar.tsx
     - Add "Actions" submenu item under each project
     - Icon: IconZap
     - Active state tracking

     File: src/components/dashboard-breadcrumb.tsx
     - Add breadcrumb for Actions page
     - Path: Dashboard > [Project Name] > Actions

     Phase 5: Analytics Integration (Optional)

     File: src/app/dashboard/[projectId]/page.tsx

     Add "Actions Performance" card:
     - List top actions by impressions
     - Show clicks and CTR for each
     - Link to detailed action analytics

     File: src/app/api/analytics/[projectId]/route.ts
     - Add actionsPerformance aggregation to existing endpoint
     - GroupBy actionId with impression/click counts

     Critical Files Summary

     New Files (8):

     1. src/app/api/projects/[projectId]/actions/route.ts - Main CRUD
     2. src/app/api/projects/[projectId]/actions/[actionId]/route.ts - Individual action CRUD
     3. src/app/api/projects/[projectId]/actions/[actionId]/analytics/route.ts - Performance metrics
     4. src/app/api/actions/active/[trackingId]/route.ts - Public endpoint for script
     5. src/app/api/track-action/route.ts - Track interactions
     6. src/app/dashboard/[projectId]/actions/page.tsx - Management UI
     7. src/components/actions/action-dialog.tsx - Create/edit form

     Modified Files (5):

     1. prisma/schema.prisma - Add Action and ActionInteraction models
     2. src/lib/tracking/tracking-script-template.ts - Add engagement module (~300 lines)
     3. src/components/app-sidebar.tsx - Add Actions menu item
     4. src/components/dashboard-breadcrumb.tsx - Add Actions breadcrumb
     5. src/app/dashboard/[projectId]/page.tsx - Optional analytics card

     Implementation Order

     1. Database (30 min)
       - Update schema.prisma
       - Run migration
       - Test with Prisma Studio
     2. API Endpoints (2-3 hours)
       - CRUD endpoints first
       - Public endpoints
       - Test with API client (Postman/Insomnia)
     3. Tracking Script (2-3 hours)
       - Add actions module to template
       - Test triggers on local HTML file
       - Verify tracking calls
     4. UI Components (3-4 hours)
       - Actions page
       - Action dialog with all tabs
       - Navigation updates
     5. Integration Testing (1-2 hours)
       - End-to-end: Create -> Deploy -> Trigger -> Track
       - Test all trigger types
       - Test URL targeting
       - Verify analytics

     Key Technical Decisions

     1. JSON Fields: Use for trigger, content, styling - allows flexible configuration without schema changes
     2. URL Patterns: Array of strings with match type - supports regex without requiring complex query language
     3. Session Tracking: Reuse existing AnalyticsSession - no additional session management needed
     4. Client-Side Rendering: Actions rendered by tracking script - no server-side HTML needed
     5. Caching Strategy: 5-minute cache on active actions - balance freshness vs performance
     6. Security: XSS protection via escapeHtml(), CORS on public endpoints, Zod validation on all inputs

     Testing Checklist

     - Database migrations run successfully
     - Cascade deletes work (delete project -> actions deleted)
     - API endpoints protected by auth
     - Zod validation rejects invalid data
     - Time trigger fires at correct delay
     - Scroll trigger fires at correct percentage
     - Exit intent detects mouse movement
     - URL patterns match correctly (all 4 types)
     - Actions render with correct styling
     - Color pickers work in dialog
     - Interactions tracked (impression/click/dismiss)
     - Analytics show correct CTR
     - Sidebar navigation works
     - Breadcrumbs update correctly

     Future Enhancements

     - A/B testing variants
     - Scheduling (start/end dates)
     - Frequency capping (max shows per visitor)
     - Device targeting (mobile/desktop)
     - Form capture in actions
     - Template library
     - Live preview mode
     - Custom CSS injection