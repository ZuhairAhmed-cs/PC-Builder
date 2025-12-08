# Contentstack Digital Experience Project Guide

A comprehensive guide for building Next.js SSR applications with Contentstack CMS, Personalize variants, and Live Preview SDK integration.

---

## Reference Implementation

This guide uses code patterns extracted from a working reference project:

|                 |                                                                           |
| --------------- | ------------------------------------------------------------------------- |
| **Repository**  | https://github.com/ZuhairAhmed-cs/PC-Builder.git                          |
| **Application** | PC Builder with experience-based personalization                          |
| **Features**    | Component selection, 3D visualization, user authentication, build sharing |

### How to Use This Guide

The examples in this guide demonstrate **patterns**, not exact code to copy:

1. **Understand the pattern** - Focus on the integration approach, not the specific field names
2. **Adapt to your domain** - Replace PC Builder terms with your application's terminology
3. **Keep core patterns** - SDK setup, Live Preview, Edge Functions, and Variant scripts work the same way across all projects

**Example adaptations:**

| PC Builder Term    | E-commerce Equivalent | Blog Equivalent | Recipe App Equivalent |
| ------------------ | --------------------- | --------------- | --------------------- |
| `component`        | `product`             | `article`       | `recipe`              |
| `category`         | `category`            | `tag`           | `cuisine`             |
| `experience_level` | `user_tier`           | `subscription`  | `skill_level`         |
| `template`         | `bundle`              | `collection`    | `meal_plan`           |

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Project Setup](#project-setup)
4. [Content Modeling](#content-modeling)
5. [Contentstack SDK Configuration](#contentstack-sdk-configuration)
6. [Live Preview SDK Integration](#live-preview-sdk-integration)
7. [Personalize Configuration](#personalize-configuration)
8. [Launch Edge Function](#launch-edge-function)
9. [Variant Creation Script](#variant-creation-script)
10. [SSR Page Implementation](#ssr-page-implementation)
11. [Deployment](#deployment)
12. [Troubleshooting](#troubleshooting)

---

## Overview

This guide walks you through building a Digital Experience Platform (DXP) application that combines:

- **Next.js 15+** with App Router and Server-Side Rendering
- **Contentstack CMS** for headless content management
- **Contentstack Personalize** for audience-based content variants
- **Contentstack Live Preview SDK** for real-time content editing in Visual Builder
- **Contentstack Launch** for edge function deployment

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User Request                                 │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Contentstack Launch                               │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Edge Function ([proxy].edge.js)                             │    │
│  │  - Reads user attributes (cookies, headers)                  │    │
│  │  - Calls Personalize SDK to resolve audience                 │    │
│  │  - Injects variant query parameter                           │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Next.js Application                            │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Server Component (force-dynamic)                            │    │
│  │  - Extracts variant param from searchParams                  │    │
│  │  - Fetches content with .variants() modifier                 │    │
│  │  - Applies live preview query if in preview mode             │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Contentstack CMS                                │
│  - Delivery API (published content)                                  │
│  - Preview API (draft content for Live Preview)                      │
│  - Variant data based on Personalize experiences                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

### Required Accounts

1. **Contentstack Account** with access to:

   - A Stack (content repository)
   - Personalize feature enabled
   - Launch deployment platform

2. **Development Environment**:
   - Node.js 18+
   - npm or yarn
   - Git

### Required Tokens

You will need the following from your Contentstack Stack:

| Token            | Where to Find                         | Purpose                   |
| ---------------- | ------------------------------------- | ------------------------- |
| API Key          | Settings → Tokens                     | Identifies your stack     |
| Delivery Token   | Settings → Tokens → Delivery Tokens   | Fetches published content |
| Preview Token    | Settings → Tokens → Preview Tokens    | Enables Live Preview      |
| Management Token | Settings → Tokens → Management Tokens | For variant scripts       |

For Personalize:

| Token        | Where to Find                  | Purpose                             |
| ------------ | ------------------------------ | ----------------------------------- |
| Project UID  | Personalize → Project Settings | Identifies your Personalize project |
| Edge API URL | Personalize → Project Settings | Edge SDK endpoint                   |

---

## Project Setup

### 1. Create Next.js Application

```bash
npx create-next-app@latest my-dxp-app --typescript --tailwind --app --src-dir=false
cd my-dxp-app
```

### 2. Install Dependencies

```bash
npm install @contentstack/delivery-sdk @contentstack/live-preview-utils @contentstack/personalize-edge-sdk @contentstack/utils
```

### 3. Configure Environment Variables

Create `.env.local`:

```bash
# Contentstack Core
NEXT_PUBLIC_CONTENTSTACK_API_KEY=your_api_key
NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token
NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT=production
NEXT_PUBLIC_CONTENTSTACK_REGION=eu

# Contentstack Live Preview (enables Visual Builder)
NEXT_PUBLIC_CONTENTSTACK_PREVIEW_TOKEN=your_preview_token

# Contentstack Personalize
NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID=your_project_uid
NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_EDGE_API_URL=https://personalize-edge.contentstack.com

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Configure MCP Server (Optional - for AI-assisted entry creation)

Create `.cursor/mcp.json`:

```json
{
  "contentstack": {
    "command": "npx",
    "args": ["-y", "@contentstack/mcp"],
    "env": {
      "CONTENTSTACK_API_KEY": "your_api_key",
      "CONTENTSTACK_DELIVERY_TOKEN": "your_delivery_token",
      "GROUPS": "cma,cda"
    }
  }
}
```

Authenticate the MCP server:

```bash
npx @contentstack/mcp --auth
```

---

## Content Modeling

### Base Content Types (Required)

For Live Preview SDK and Visual Builder to work, you need these three base content types:

#### 1. Header (Single Type)

```
Content Type UID: header
Type: Single

Fields:
├── title (Text) - Internal title
├── logo (File) - Site logo image
├── name (Text) - Site name displayed in header
├── description (Text) - Site tagline
└── link (Group - Multiple)
    ├── title (Text) - Link label
    └── href (Text) - Link URL
```

#### 2. Footer (Single Type)

```
Content Type UID: footer
Type: Single

Fields:
├── title (Text) - Internal title
├── logo (File) - Footer logo
├── name (Text) - Site name
├── description (Text) - Footer description
├── nav_links (Group - Multiple)
│   ├── title (Text) - Link label
│   └── href (Text) - Link URL
└── copyright (Text) - Copyright text
```

#### 3. Page (Multiple Type) - CRITICAL

```
Content Type UID: page
Type: Multiple

Fields:
├── title (Text) - Page title
├── url (Text) - MANDATORY - Page URL path (e.g., "/", "/builder", "/templates")
└── sections (Modular Blocks) - Page content sections
    ├── hero (Block)
    ├── builder (Block)
    ├── template (Block)
    └── [custom blocks based on your needs]
```

**Important**: The `url` field is **mandatory** for the Visual Builder to navigate between pages. Each page entry should have a unique URL value.

### User-Defined Content Types

Create additional content types based on YOUR application needs. These are referenced within Page modular blocks.

> **Note**: The following is an example from the PC Builder reference project. Your content types will be different based on your application domain.

**Example from PC Builder reference:**

#### Component Content Type

```
Content Type UID: component
Type: Multiple

Fields:
├── title (Text) - Component name
├── category (Select) - cpu, gpu, motherboard, ram, storage, psu, case, cooling
├── brand (Text) - Manufacturer
├── price (Number) - Price in dollars
├── image (File) - Product image
├── description (Rich Text) - Product description
├── specifications (Group - Multiple)
│   ├── key (Text) - Spec name
│   └── value (Text) - Spec value
├── socket_type (Text) - For CPUs/motherboards
├── power_requirement (Number) - Watts
├── compatibility_notes (Rich Text) - Notes for compatibility
└── product_links (Group - Multiple)
    ├── retailer (Text) - Store name
    ├── link (Link) - Product URL
    ├── price (Number) - Store price
    └── stock_status (Select) - in_stock, limited, out_of_stock
```

**For YOUR application**, create content types that model your domain. Examples:

| Domain      | Content Types                                                  |
| ----------- | -------------------------------------------------------------- |
| E-commerce  | `product`, `category`, `brand`, `review`, `promotion`          |
| Blog/News   | `article`, `author`, `tag`, `comment`, `series`                |
| Portfolio   | `project`, `skill`, `client`, `testimonial`, `service`         |
| Restaurant  | `menu_item`, `cuisine`, `chef`, `location`, `special`          |
| Real Estate | `property`, `agent`, `neighborhood`, `amenity`, `listing_type` |

### Modular Block Examples

Modular blocks allow flexible page composition. Design blocks based on YOUR page sections.

> **Pattern**: Each block references your user-defined content types

#### Hero Block (PC Builder Example)

```
Block UID: hero

Fields:
├── title (Text) - Hero headline
├── description (Text) - Hero description
├── experience_levels (Reference - Multiple) - References to experience_level entries
└── features (Group - Multiple)
    ├── icon (Text) - Emoji or icon code
    ├── title (Text) - Feature title
    └── description (Text) - Feature description
```

#### Builder Block (PC Builder Example)

```
Block UID: builder

Fields:
└── component_group (Group - Multiple)
    ├── category (Reference) - Reference to category entry
    └── components (Reference - Multiple) - References to component entries
```

#### Generic Block Pattern

```
Block UID: [your_block_name]

Fields:
├── title (Text) - Section title
├── description (Text) - Section description
├── [content_reference] (Reference - Multiple) - Your content type entries
└── [optional_settings] (Group) - Block-specific configuration
```

**Example blocks for other domains:**

- **E-commerce**: `product_carousel`, `featured_categories`, `testimonials`
- **Blog**: `latest_articles`, `author_spotlight`, `related_posts`
- **Portfolio**: `project_showcase`, `skills_grid`, `client_logos`

### Creating Page Entries

Create page entries with appropriate URLs:

| Page      | URL Field    | Modular Blocks |
| --------- | ------------ | -------------- |
| Home      | `/`          | hero           |
| Builder   | `/builder`   | builder        |
| Templates | `/templates` | template       |
| About     | `/about`     | hero, features |

---

## Contentstack SDK Configuration

### Create SDK Client

Create `lib/contentstack/client.ts`:

```typescript
import contentstack from "@contentstack/delivery-sdk";
import ContentstackLivePreview, {
  IStackSdk,
} from "@contentstack/live-preview-utils";

// Environment variables
export const API_KEY = process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY || "";
const DELIVERY_TOKEN =
  process.env.NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN || "";
export const ENVIRONMENT =
  process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT || "production";
export const PREVIEW_TOKEN =
  process.env.NEXT_PUBLIC_CONTENTSTACK_PREVIEW_TOKEN || "";
export const REGION = process.env.NEXT_PUBLIC_CONTENTSTACK_REGION || "us";

export const DEFAULT_LOCALE = "en-us";

export type QueryParams = Record<string, string | string[] | undefined>;

// Live Preview query parameters
const LIVE_PREVIEW_HASH_PARAM = "live_preview";
const CONTENT_TYPE_UID_PARAM = "content_type_uid";
const ENTRY_UID_PARAM = "entry_uid";
const PREVIEW_TIMESTAMP_PARAM = "preview_timestamp";

// Region-specific hosts
function getApiHost(): string {
  switch (REGION) {
    case "eu":
      return "eu-cdn.contentstack.com";
    case "azure-na":
      return "azure-na-cdn.contentstack.com";
    case "azure-eu":
      return "azure-eu-cdn.contentstack.com";
    default:
      return "cdn.contentstack.com";
  }
}

function getPreviewHost(): string {
  switch (REGION) {
    case "eu":
      return "eu-rest-preview.contentstack.com";
    case "azure-na":
      return "azure-na-rest-preview.contentstack.com";
    case "azure-eu":
      return "azure-eu-rest-preview.contentstack.com";
    default:
      return "rest-preview.contentstack.com";
  }
}

export function getAppHost(): string {
  switch (REGION) {
    case "eu":
      return "eu-app.contentstack.com";
    case "azure-na":
      return "azure-na-app.contentstack.com";
    case "azure-eu":
      return "azure-eu-app.contentstack.com";
    default:
      return "app.contentstack.com";
  }
}

// Helper to extract query param value
function getQueryParamValue(
  queryParams: QueryParams,
  key: string
): string | undefined {
  const value = queryParams[key];
  if (typeof value === "string") {
    return value;
  } else if (Array.isArray(value) && value.length > 0) {
    return value[0];
  }
  return undefined;
}

// Initialize the SDK
function initializeContentstackSdk() {
  const config: Parameters<typeof contentstack.stack>[0] = {
    apiKey: API_KEY,
    deliveryToken: DELIVERY_TOKEN,
    environment: ENVIRONMENT,
    host: getApiHost(),
  };

  // Enable live preview if preview token is provided
  if (PREVIEW_TOKEN) {
    config.live_preview = {
      enable: true,
      preview_token: PREVIEW_TOKEN,
      host: getPreviewHost(),
    };
  }

  return contentstack.stack(config);
}

export const stack = initializeContentstackSdk();

// Initialize Live Preview SDK (call in client component)
export function initLivePreview() {
  ContentstackLivePreview.init({
    ssr: true,
    enable: Boolean(PREVIEW_TOKEN),
    mode: "builder",
    stackSdk: stack.config as IStackSdk,
    stackDetails: {
      apiKey: API_KEY,
      environment: ENVIRONMENT,
    },
    clientUrlParams: {
      protocol: "https",
      host: getAppHost(),
      port: 443,
    },
    editButton: {
      enable: true,
      exclude: ["outsideLivePreviewPortal"],
    },
  });
}

// Apply live preview query parameters to the stack
export function applyLivePreviewQuery(queryParams?: QueryParams): void {
  if (!queryParams || !PREVIEW_TOKEN) return;

  const livePreviewHash = getQueryParamValue(
    queryParams,
    LIVE_PREVIEW_HASH_PARAM
  );

  if (livePreviewHash) {
    stack.livePreviewQuery({
      live_preview: livePreviewHash,
      contentTypeUid:
        getQueryParamValue(queryParams, CONTENT_TYPE_UID_PARAM) || "",
      entryUid: getQueryParamValue(queryParams, ENTRY_UID_PARAM) || "",
      preview_timestamp:
        getQueryParamValue(queryParams, PREVIEW_TIMESTAMP_PARAM) || "",
    });
  }
}

// Check if currently in live preview mode
export function isLivePreviewMode(queryParams?: QueryParams): boolean {
  if (!queryParams) return false;
  return Boolean(queryParams[LIVE_PREVIEW_HASH_PARAM]);
}

// Re-export for convenience
export const onEntryChange = ContentstackLivePreview.onEntryChange;

// Content type UIDs
// CUSTOMIZE: Add your application's content type UIDs
export const CONTENT_TYPES = {
  // Base types (required for all DXP projects)
  PAGE: "page",
  HEADER: "header",
  FOOTER: "footer",
  // PC Builder example custom types:
  // COMPONENT: "component",
  // TEMPLATE: "template",
  // CATEGORY: "category",
  // Your app's custom types go here
} as const;

// Check if SDK is configured
export function isContentstackConfigured(): boolean {
  return Boolean(API_KEY && DELIVERY_TOKEN && ENVIRONMENT);
}
```

### Create Query Functions

Create `lib/contentstack/queries.ts`:

```typescript
import { QueryOperation } from "@contentstack/delivery-sdk";
import Personalize from "@contentstack/personalize-edge-sdk";
import { addEditableTags } from "@contentstack/utils";
import {
  stack,
  CONTENT_TYPES,
  isContentstackConfigured,
  PREVIEW_TOKEN,
  DEFAULT_LOCALE,
  applyLivePreviewQuery,
  type QueryParams,
} from "./client";

const isPreviewEnabled = Boolean(PREVIEW_TOKEN);

// Add editable tags for live preview
function addEditableTagsIfPreview(entry: any, contentTypeUid: string): void {
  if (isPreviewEnabled && entry) {
    addEditableTags(entry, contentTypeUid, true, DEFAULT_LOCALE);
  }
}

// Fetch page by URL with variant support
export async function getPageByUrl(
  url: string,
  variantParam?: string,
  queryParams?: QueryParams
): Promise<any | null> {
  if (!isContentstackConfigured()) {
    console.warn("Contentstack is not configured");
    return null;
  }

  // Apply live preview query params
  applyLivePreviewQuery(queryParams);

  try {
    let entriesQuery = stack.contentType(CONTENT_TYPES.PAGE).entry();

    // CUSTOMIZE: Include references based on YOUR page URL and modular block structure
    // The path format is: sections.[blockName].[referenceField]
    //
    // PC Builder example:
    if (url === "/") {
      entriesQuery = entriesQuery.includeReference([
        "sections.hero.experience_levels",
      ]);
    } else if (url === "/builder") {
      entriesQuery = entriesQuery.includeReference([
        "sections.builder.component_group.category",
        "sections.builder.component_group.components",
      ]);
    } else if (url === "/templates") {
      entriesQuery = entriesQuery.includeReference([
        "sections.template.reference",
        "sections.template.reference.components",
      ]);
    }
    //
    // E-commerce example would be:
    // if (url === "/") {
    //   entriesQuery = entriesQuery.includeReference(["sections.hero.featured_products"]);
    // } else if (url === "/products") {
    //   entriesQuery = entriesQuery.includeReference(["sections.product_grid.products", "sections.product_grid.categories"]);
    // }

    // Apply variants if variant param is provided
    if (variantParam) {
      const variantAliases =
        Personalize.variantParamToVariantAliases(variantParam);
      entriesQuery = entriesQuery.variants(variantAliases.join(","));
    }

    // Query by URL field
    const result = await entriesQuery
      .query()
      .where("url", QueryOperation.EQUALS, url)
      .find();

    const entry = result.entries?.[0] || null;
    if (entry) {
      addEditableTagsIfPreview(entry, CONTENT_TYPES.PAGE);
    }
    return entry;
  } catch (error) {
    console.error(`Error fetching page ${url}:`, error);
    return null;
  }
}

// Fetch header (single type)
export async function getHeader(
  queryParams?: QueryParams
): Promise<any | null> {
  if (!isContentstackConfigured()) return null;

  applyLivePreviewQuery(queryParams);

  try {
    const result = await stack.contentType(CONTENT_TYPES.HEADER).entry().find();
    const entry = result.entries?.[0] || null;
    if (entry) {
      addEditableTagsIfPreview(entry, CONTENT_TYPES.HEADER);
    }
    return entry;
  } catch (error) {
    console.error("Error fetching header:", error);
    return null;
  }
}

// Fetch footer (single type)
export async function getFooter(
  queryParams?: QueryParams
): Promise<any | null> {
  if (!isContentstackConfigured()) return null;

  applyLivePreviewQuery(queryParams);

  try {
    const result = await stack.contentType(CONTENT_TYPES.FOOTER).entry().find();
    const entry = result.entries?.[0] || null;
    if (entry) {
      addEditableTagsIfPreview(entry, CONTENT_TYPES.FOOTER);
    }
    return entry;
  } catch (error) {
    console.error("Error fetching footer:", error);
    return null;
  }
}
```

### Create Index Export

Create `lib/contentstack/index.ts`:

```typescript
export * from "./client";
export * from "./queries";
```

---

## Live Preview SDK Integration

### Create Live Preview Client Component

Create `components/contentstack-live-preview.tsx`:

```typescript
"use client";

import { initLivePreview } from "@/lib/contentstack";
import React, { useEffect } from "react";

export function ContentstackLivePreview({
  children,
}: {
  children?: React.ReactNode;
}) {
  const livePreviewEnabled = process.env.NEXT_PUBLIC_CONTENTSTACK_PREVIEW_TOKEN;

  useEffect(() => {
    if (livePreviewEnabled) {
      initLivePreview();
    }
  }, [livePreviewEnabled]);

  return <>{children}</>;
}
```

### Add to Root Layout

Update `app/layout.tsx`:

```typescript
import { ContentstackLivePreview } from "@/components/contentstack-live-preview";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        {/* Add Live Preview component at the end */}
        <ContentstackLivePreview />
      </body>
    </html>
  );
}
```

### Using Editable Tags

After fetching entries, the `$` property contains `data-cslp` attributes for each field:

```tsx
// In your component
export function HeroSection({ hero }: { hero: any }) {
  return (
    <section>
      {/* Spread the $ attributes to make fields editable in Visual Builder */}
      <h1 {...hero.$?.title}>{hero.title}</h1>
      <p {...hero.$?.description}>{hero.description}</p>

      {/* For nested fields like images */}
      <img src={hero.image?.url} alt={hero.title} {...hero.image?.$?.url} />

      {/* For array fields */}
      {hero.features?.map((feature, index) => (
        <div key={index}>
          <span {...feature.$?.icon}>{feature.icon}</span>
          <h3 {...feature.$?.title}>{feature.title}</h3>
          <p {...feature.$?.description}>{feature.description}</p>
        </div>
      ))}
    </section>
  );
}
```

---

## Personalize Configuration

### Step 1: Create Personalize Project

1. Go to **Contentstack Dashboard** → **Personalize**
2. Click **Create New Project**
3. Note down the **Project UID** and **Edge API URL**

### Step 2: Create Custom Attributes

Custom attributes allow you to pass user data for audience matching. Create attributes based on YOUR personalization strategy.

1. Go to **Personalize** → **Attributes**
2. Click **Add Attribute**
3. Create attributes based on your personalization needs

**PC Builder example attributes:**

| Attribute Name     | Type   | Description                                              |
| ------------------ | ------ | -------------------------------------------------------- |
| `experience_level` | String | User's experience level (beginner, intermediate, expert) |

**Other domain examples:**

| Domain      | Attribute      | Values                          |
| ----------- | -------------- | ------------------------------- |
| E-commerce  | `user_tier`    | free, premium, vip              |
| Blog        | `subscription` | anonymous, subscriber, patron   |
| SaaS        | `plan_type`    | trial, starter, pro, enterprise |
| Education   | `skill_level`  | novice, intermediate, advanced  |
| Real Estate | `buyer_type`   | first_time, investor, luxury    |

### Step 3: Create Audiences

Audiences define the conditions for matching users.

1. Go to **Personalize** → **Audiences**
2. Click **Create Audience**
3. Configure conditions:

**Example: Beginner Audience**

```
Conditions:
- experience_level EQUALS "beginner"
```

**Example: Intermediate Audience**

```
Conditions:
- experience_level EQUALS "intermediate"
```

**Example: Expert Audience**

```
Conditions:
- experience_level EQUALS "expert"
```

### Step 4: Create Experiences

Experiences connect audiences to variant aliases.

1. Go to **Personalize** → **Experiences**
2. Click **Create Experience**
3. Select **Personalized Experience**
4. Add variations:

| Variation            | Audience              | Variant Alias  |
| -------------------- | --------------------- | -------------- |
| Beginner Content     | Beginner Audience     | `beginner`     |
| Intermediate Content | Intermediate Audience | `intermediate` |
| Expert Content       | Expert Audience       | `expert`       |

### Step 5: Publish Experience

1. Review your experience configuration
2. Click **Publish** to activate

---

## Launch Edge Function

### Create Edge Function

Create `functions/[proxy].edge.js`:

> **Customization Points:**
>
> 1. `EXPERIENCE_COOKIE_NAME` - Name of cookie storing your personalization attribute
> 2. `personalizedPaths` array - Which routes need personalization
> 3. `personalizeSdk.set({...})` - Attributes matching your Personalize audiences

```javascript
import Personalize from "@contentstack/personalize-edge-sdk";

// CUSTOMIZE: Cookie name for storing user's personalization attribute
// PC Builder uses "my_app_experience" for experience level
// Your app might use "user_tier", "region", "subscription_type", etc.
const EXPERIENCE_COOKIE_NAME = "my_app_experience";

/**
 * Extract cookie value from request
 */
function getCookieValue(request, cookieName) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.split("=");
    if (name === cookieName) {
      return valueParts.join("=");
    }
  }
  return null;
}

/**
 * Edge function handler
 * Intercepts requests and injects personalization parameters
 */
export default async function handler(request, context) {
  const parsedUrl = new URL(request.url);
  const pathname = parsedUrl.pathname;

  // CUSTOMIZE: Define which paths should be personalized
  // PC Builder example: ["/builder", "/templates"]
  // E-commerce example: ["/products", "/checkout", "/recommendations"]
  // Blog example: ["/articles", "/premium-content"]
  const personalizedPaths = ["/builder", "/templates"];
  const shouldPersonalize = personalizedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // If not a personalized path, pass through
  if (!shouldPersonalize) {
    return fetch(request);
  }

  // Get Personalize configuration from environment
  const edgeApiUrl =
    context.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_EDGE_API_URL;
  const projectUid =
    context.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID;

  // Validate configuration
  if (!projectUid) {
    console.error("Personalize Project UID not configured");
    return fetch(request);
  }

  // Set custom edge API URL if provided
  if (edgeApiUrl) {
    Personalize.setEdgeApiUrl(edgeApiUrl);
  }

  try {
    // Reset SDK state for clean initialization
    Personalize.reset();

    // Initialize SDK with request context
    const personalizeSdk = await Personalize.init(projectUid, { request });

    // CUSTOMIZE: Get user attributes from cookies/headers
    // This depends on how YOUR app stores user data
    const experienceLevel = getCookieValue(request, EXPERIENCE_COOKIE_NAME);

    // CUSTOMIZE: Set attributes that match YOUR Personalize audiences
    // PC Builder example: experience_level = beginner|intermediate|expert
    // E-commerce example: user_tier = free|premium|vip
    // Blog example: subscription = free|subscriber|patron
    if (experienceLevel) {
      personalizeSdk.set({ experience_level: experienceLevel });
    }

    // You can set multiple attributes based on your personalization strategy
    const userSegment = request.headers.get("x-user-segment");
    if (userSegment) {
      personalizeSdk.set({ user_segment: userSegment });
    }

    // Get the variant parameter based on audience match
    const variantParam = personalizeSdk.getVariantParam();

    // Inject variant param into request URL
    parsedUrl.searchParams.set(
      personalizeSdk.VARIANT_QUERY_PARAM,
      variantParam
    );

    // Create modified request with variant parameter
    const modifiedRequest = new Request(parsedUrl.toString(), request);

    // Fetch the response
    const response = await fetch(modifiedRequest);

    // Create modified response
    const modifiedResponse = new Response(response.body, response);

    // Persist Personalize state in response headers/cookies
    personalizeSdk.addStateToResponse(modifiedResponse);

    // Disable caching for personalized responses
    modifiedResponse.headers.set("cache-control", "no-store");

    return modifiedResponse;
  } catch (error) {
    console.error("Personalization error:", error);
    // Fall back to non-personalized response on error
    return fetch(request);
  }
}
```

### Configure Launch Deployment

1. Go to **Contentstack Dashboard** → **Launch**
2. Connect your Git repository
3. Configure build settings:
   - Framework: Next.js
   - Build command: `npm run build`
   - Output directory: `.next`
4. Add environment variables in Launch settings
5. Deploy

---

## Variant Creation Script

### Understanding Variant Updates

When creating content variants programmatically, you need to understand the changeset and metadata patterns.

> **Note**: The script structure below uses PC Builder fields as examples. Adapt the `VARIANT_DATA` structure and field names to match YOUR content types.

### Key Concepts

1. **Base Entry**: The original entry without variants
2. **Variant Entry**: A modified version for a specific audience
3. **Changeset**: Array of field paths that differ from base
4. **Metadata UID**: Unique identifier for each field instance

### Changeset Rules

1. **Simple Fields**: Add field name to changeset

   ```javascript
   changeSet.push("description");
   changeSet.push("compatibility_notes");
   ```

2. **Existing Array Items**: Reference by `_metadata.uid`

   ```javascript
   changeSet.push(`specifications.${existingUid}.key`);
   changeSet.push(`specifications.${existingUid}.value`);
   ```

3. **New Array Items**: Use `$new_` prefix with UUID
   ```javascript
   changeSet.push(`specifications.$new_${uuid}`);
   ```

### Complete Variant Update Script

Create `scripts/update-variants.js`:

```javascript
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

// CUSTOMIZE: Update with your values
const CONFIG = {
  apiKey: "your_api_key",
  authtoken: "your_management_token",
  baseUrl: "https://eu-api.contentstack.com/v3", // Adjust for your region
  contentType: "component", // CUSTOMIZE: Your content type UID
  locale: "en-us",
  variants: {
    // CUSTOMIZE: Variant UIDs from your Personalize experience
    intermediate: "variant_uid_intermediate",
    expert: "variant_uid_expert",
  },
};

// CUSTOMIZE: Variant data structure based on YOUR content type fields
// Structure: Entry UID -> variant level -> field values
//
// PC Builder example (component content type):
const VARIANT_DATA = {
  blt123456789: {
    intermediate: {
      description: "Intermediate level description...",
      specifications: [
        { key: "Feature 1", value: "Value 1" },
        { key: "Feature 2", value: "Value 2" },
      ],
      compatibility_notes: "Notes for intermediate users...",
    },
    expert: {
      description: "Expert level technical description...",
      specifications: [
        { key: "Technical Spec 1", value: "Advanced Value 1" },
        { key: "Technical Spec 2", value: "Advanced Value 2" },
      ],
      compatibility_notes: "Detailed technical compatibility notes...",
    },
  },
};

// E-commerce example (product content type) would look like:
// const VARIANT_DATA = {
//   "product_uid": {
//     premium: {
//       description: "Exclusive premium product details...",
//       pricing_info: "Premium member pricing...",
//       features: [{ key: "Exclusive", value: "Yes" }],
//     },
//     vip: {
//       description: "VIP exclusive product description...",
//       pricing_info: "VIP special pricing...",
//       features: [{ key: "VIP Only", value: "Limited Edition" }],
//     },
//   },
// };

// Generate new metadata UID for new array items
function generateNewMetadataUid() {
  return `$new_${uuidv4()}`;
}

// Match specifications by key name
function matchSpecificationByKey(newSpec, existingSpecs) {
  const match = existingSpecs.find((s) => s.key === newSpec.key);
  return match?._metadata?.uid || null;
}

// Build specifications array with proper metadata
function buildSpecificationsArray(newSpecs, existingSpecs) {
  const result = [];

  for (const newSpec of newSpecs) {
    const existingUid = matchSpecificationByKey(newSpec, existingSpecs);

    result.push({
      key: newSpec.key,
      value: newSpec.value,
      _metadata: {
        uid: existingUid || generateNewMetadataUid(),
      },
    });
  }

  return result;
}

// Build changeset array
function buildChangeSet(specifications) {
  const changeSet = ["description", "compatibility_notes"];

  for (const spec of specifications) {
    const uid = spec._metadata.uid;

    if (uid.startsWith("$new_")) {
      // New specification: add entire object
      changeSet.push(`specifications.${uid}`);
    } else {
      // Existing specification: add individual fields
      changeSet.push(`specifications.${uid}.key`);
      changeSet.push(`specifications.${uid}.value`);
    }
  }

  return changeSet;
}

// Fetch entry with metadata
async function fetchEntryWithMetadata(entryUid) {
  const url = `${CONFIG.baseUrl}/content_types/${CONFIG.contentType}/entries/${entryUid}`;

  try {
    const response = await axios.get(url, {
      params: {
        locale: CONFIG.locale,
        include_metadata: true,
      },
      headers: {
        api_key: CONFIG.apiKey,
        authtoken: CONFIG.authtoken,
      },
    });

    return response.data.entry;
  } catch (error) {
    console.error(
      `Error fetching entry ${entryUid}:`,
      error.response?.data || error.message
    );
    throw error;
  }
}

// Update variant
async function updateVariant(entryUid, variantUid, payload, dryRun = false) {
  const url = `${CONFIG.baseUrl}/content_types/${CONFIG.contentType}/entries/${entryUid}/variants/${variantUid}`;

  if (dryRun) {
    console.log("\n[DRY RUN] Would send PUT request to:", url);
    console.log("[DRY RUN] Payload:", JSON.stringify(payload, null, 2));
    return { dry_run: true, payload };
  }

  try {
    const response = await axios.put(url, payload, {
      params: {
        form_uid: CONFIG.contentType,
        entry_uid: entryUid,
        locale: CONFIG.locale,
        variant_uid: variantUid,
      },
      headers: {
        api_key: CONFIG.apiKey,
        authtoken: CONFIG.authtoken,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      `Error updating variant:`,
      error.response?.data || error.message
    );
    throw error;
  }
}

// Process single component variant
async function processComponentVariant(
  entryUid,
  experienceLevel,
  dryRun = false
) {
  console.log(`\nProcessing: ${entryUid} - ${experienceLevel.toUpperCase()}`);

  // Check if variant data exists
  if (!VARIANT_DATA[entryUid]?.[experienceLevel]) {
    console.log(`❌ No variant data for entry ${entryUid}`);
    return;
  }

  const variantData = VARIANT_DATA[entryUid][experienceLevel];

  // Fetch entry with metadata
  console.log("📥 Fetching entry with metadata...");
  const entry = await fetchEntryWithMetadata(entryUid);
  console.log(`✅ Fetched: ${entry.title}`);

  // Build specifications with proper metadata
  const specifications = buildSpecificationsArray(
    variantData.specifications,
    entry.specifications || []
  );

  // Build changeset
  const changeSet = buildChangeSet(specifications);
  console.log(`📋 Changeset: ${changeSet.length} items`);

  // Build payload
  const payload = {
    entry: {
      description: variantData.description,
      specifications: specifications,
      compatibility_notes: variantData.compatibility_notes,
      _variant: {
        _change_set: changeSet,
      },
    },
  };

  // Update variant
  const variantUid = CONFIG.variants[experienceLevel];
  console.log(`🔄 Updating variant: ${variantUid}...`);

  await updateVariant(entryUid, variantUid, payload, dryRun);
  console.log("✅ Variant updated successfully");
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const entryArg = args.find((arg) => arg.startsWith("--entry="));
  const targetEntry = entryArg ? entryArg.split("=")[1] : null;

  console.log("\n🚀 Variant Update Script");
  console.log(`Mode: ${dryRun ? "🔍 DRY RUN" : "✍️ LIVE UPDATE"}`);

  try {
    if (targetEntry) {
      // Single entry
      await processComponentVariant(targetEntry, "intermediate", dryRun);
      await processComponentVariant(targetEntry, "expert", dryRun);
    } else {
      // All entries
      for (const entryUid of Object.keys(VARIANT_DATA)) {
        await processComponentVariant(entryUid, "intermediate", dryRun);
        await processComponentVariant(entryUid, "expert", dryRun);
      }
    }

    console.log("\n✅ Script completed successfully!");
  } catch (error) {
    console.error("\n❌ Script failed:", error.message);
    process.exit(1);
  }
}

main();
```

### Running the Script

```bash
# Install dependencies
npm install axios uuid

# Test with dry run first
node scripts/update-variants.js --dry-run

# Update single entry
node scripts/update-variants.js --entry=blt123456789 --dry-run

# Run actual update
node scripts/update-variants.js

# Update single entry (actual)
node scripts/update-variants.js --entry=blt123456789
```

### After Creating Variants

**Important**: After creating variants, you must publish them:

1. Go to **Contentstack** → **Entries**
2. Open each entry with variants
3. Click **Publish** → Select **All Variants**
4. Publish to your environment

---

## SSR Page Implementation

### Page Component Pattern

Create pages with `force-dynamic` and `searchParams`.

> **Note**: The component names and data extraction below are from PC Builder. Adapt to YOUR page structure and data shapes.

```typescript
// CUSTOMIZE: app/[your-page]/page.tsx
// PC Builder example: app/builder/page.tsx
import Personalize from "@contentstack/personalize-edge-sdk";
import { getPageByUrl } from "@/lib/contentstack";

// Force dynamic rendering for personalization (REQUIRED for variants)
export const dynamic = "force-dynamic";

export default async function BuilderPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  // Await searchParams (Next.js 15+ pattern)
  const params = await searchParams;

  // Extract variant param injected by edge function
  const variantParam = params[Personalize.VARIANT_QUERY_PARAM];

  // Fetch page with variants and live preview support
  const pageData = await getPageByUrl("/builder", variantParam, params);

  if (!pageData) {
    return <div>Page not found</div>;
  }

  return <BuilderClient pageData={pageData} />;
}
```

### Client Component for Interactivity

```typescript
// components/builder-client.tsx
"use client";

import { useState } from "react";

export function BuilderClient({ pageData }: { pageData: any }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Extract data from page sections
  const builderSection = pageData.sections?.find(
    (s: any) => "builder" in s
  )?.builder;

  return (
    <div>
      {/* Use editable tags from pageData */}
      <h1 {...pageData.$?.title}>{pageData.title}</h1>

      {/* Render component groups */}
      {builderSection?.component_group?.map((group: any, index: number) => (
        <div key={index}>
          {/* Category info with live preview support */}
          <h2 {...group.category?.[0]?.$?.display_name}>
            {group.category?.[0]?.display_name}
          </h2>

          {/* Components */}
          {group.components?.map((component: any) => (
            <div key={component.uid}>
              <h3 {...component.$?.title}>{component.title}</h3>
              <p {...component.$?.description}>{component.description}</p>
              <span {...component.$?.price}>${component.price}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

### Header/Footer Server Components

```typescript
// components/layout/header.tsx
import { headers } from "next/headers";
import { getHeader, isContentstackConfigured } from "@/lib/contentstack";

// Extract query params from referer for live preview
async function getQueryParams(): Promise<Record<string, string>> {
  try {
    const headersList = await headers();
    const referer = headersList.get("referer");
    if (referer) {
      const url = new URL(referer);
      const params: Record<string, string> = {};
      url.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      return params;
    }
  } catch {}
  return {};
}

export async function Header() {
  if (!isContentstackConfigured()) {
    return <header>Header not configured</header>;
  }

  const queryParams = await getQueryParams();
  const headerData = await getHeader(queryParams);

  if (!headerData) {
    return <header>Header content not found</header>;
  }

  return (
    <header>
      <img
        src={headerData.logo?.url}
        alt={headerData.name}
        {...headerData.logo?.$?.url}
      />
      <nav>
        {headerData.link?.map((link: any, index: number) => (
          <a key={index} href={link.href} {...link.$?.title}>
            {link.title}
          </a>
        ))}
      </nav>
    </header>
  );
}
```

---

## Deployment

### Contentstack Launch Deployment

1. **Connect Repository**

   - Go to **Launch** → **Create Deployment**
   - Connect your GitHub/GitLab repository
   - Select branch

2. **Configure Build Settings**

   ```
   Framework: Next.js
   Build Command: npm run build
   Output Directory: .next
   Node Version: 18.x
   ```

3. **Add Environment Variables**
   Add all variables from your `.env.local`:

   - `NEXT_PUBLIC_CONTENTSTACK_API_KEY`
   - `NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN`
   - `NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT`
   - `NEXT_PUBLIC_CONTENTSTACK_REGION`
   - `NEXT_PUBLIC_CONTENTSTACK_PREVIEW_TOKEN`
   - `NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID`
   - `NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_EDGE_API_URL`

4. **Deploy**
   - Click **Deploy**
   - Edge function in `functions/[proxy].edge.js` deploys automatically

### Post-Deployment Checklist

- [ ] Verify environment variables are set
- [ ] Test personalization on deployed URL
- [ ] Verify Live Preview works in Visual Builder
- [ ] Publish all entry variants
- [ ] Test variant resolution for different audiences

---

## Troubleshooting

### Common Issues

#### 1. Live Preview Not Working

**Symptoms**: Changes in Visual Builder don't reflect on preview

**Solutions**:

- Verify `NEXT_PUBLIC_CONTENTSTACK_PREVIEW_TOKEN` is set
- Check that `ContentstackLivePreview` component is in layout
- Ensure `applyLivePreviewQuery` is called in query functions
- Verify preview host matches your region

#### 2. Variants Not Loading

**Symptoms**: Same content shows for all audiences

**Solutions**:

- Check that `force-dynamic` is set on the page
- Verify edge function is deployed and running
- Check Personalize experience is published
- Verify custom attributes are being set correctly
- Check variant aliases match experience configuration

#### 3. Reference Fields Not Resolving

**Symptoms**: Reference fields return `{ uid, _content_type_uid }` instead of full data

**Solutions**:

- Add correct `includeReference` paths
- Path must match modular block structure: `sections.blockname.fieldname`
- For nested references: `sections.builder.component_group.components`

#### 4. Editable Tags Not Appearing

**Symptoms**: `$` property is undefined on entries

**Solutions**:

- Ensure `addEditableTags` is called after fetching
- Pass correct `contentTypeUid` and `locale`
- Verify `PREVIEW_TOKEN` is configured

#### 5. Edge Function Errors

**Symptoms**: Personalization fails silently

**Solutions**:

- Check Launch logs for errors
- Verify `PERSONALIZE_PROJECT_UID` is correct
- Ensure experience is published
- Check cookie name matches your implementation

### Debug Mode

Add logging to edge function:

```javascript
export default async function handler(request, context) {
  console.log("Request URL:", request.url);
  console.log("Cookies:", request.headers.get("cookie"));

  // ... rest of handler

  console.log("Variant Param:", variantParam);
}
```

View logs in **Launch** → **Deployments** → **Logs**

---

## Next Steps

1. **Customize Content Types**: Create content types specific to your application
2. **Add More Audiences**: Create additional audience segments
3. **Implement Analytics**: Track personalization effectiveness
4. **Add A/B Testing**: Use Personalize experiments
5. **Optimize Performance**: Add caching strategies for non-personalized content

---

## Reference

### Useful Links

- [Contentstack Delivery SDK](https://www.contentstack.com/docs/developers/sdks/content-delivery-sdk/javascript-browser)
- [Live Preview SDK](https://www.contentstack.com/docs/developers/set-up-live-preview)
- [Personalize Edge SDK](https://www.contentstack.com/docs/developers/personalize/edge-sdk)
- [Launch Documentation](https://www.contentstack.com/docs/developers/launch)

### Package Versions

```json
{
  "@contentstack/delivery-sdk": "^4.10.3",
  "@contentstack/live-preview-utils": "^4.1.2",
  "@contentstack/personalize-edge-sdk": "^1.0.19",
  "@contentstack/utils": "^1.6.3"
}
```
