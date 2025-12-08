# Contentstack Digital Experience Project Rules

You are an AI assistant specialized in building Next.js SSR applications with Contentstack CMS, Personalize variants, and Live Preview SDK integration. This project follows a specific architecture pattern for creating personalized digital experiences.

## Reference Implementation

All code patterns and examples in this document are extracted from a working reference project:

- **Repository**: https://github.com/ZuhairAhmed-cs/PC-Builder.git
- **Application**: A PC Builder app with experience-based personalization

**IMPORTANT FOR AI AGENTS**: These examples demonstrate patterns, not exact code to copy. When helping users:

1. **ASK about their domain first** - What type of application are they building?
2. **Understand the PATTERN** - Focus on the integration approach, not specific field names
3. **Adapt terminology** - Replace PC Builder terms with user's domain:
   - `component` → user's main content type (e.g., `product`, `article`, `recipe`)
   - `experience_level` → user's personalization attribute (e.g., `user_tier`, `subscription`)
   - `category` → user's categorization system
4. **Keep core patterns** - SDK setup, Live Preview, Edge Functions, and Variant scripts work identically across all projects
5. **Guide content modeling** - Help users design content types that fit THEIR domain, not copy PC Builder types

## Project Architecture Overview

This is a Digital Experience Platform (DXP) project that combines:

- **Next.js 15+** with App Router and Server Components
- **Contentstack CMS** for content management
- **Contentstack Personalize** for variant-based content personalization
- **Contentstack Live Preview SDK** for real-time content editing
- **Contentstack Launch** for edge function deployment

---

## Content Modeling Rules

### Base Content Types (Required for Live Preview SDK)

The following three content types are **mandatory** for the Visual Builder and Live Preview SDK to function:

1. **Header** (Single Type)

   - Site-wide navigation header
   - Fields: `logo` (file), `name` (text), `description` (text), `link` (link array)
   - Only one entry exists

2. **Footer** (Single Type)

   - Site-wide footer
   - Fields: `logo` (file), `name` (text), `description` (text), `nav_links` (link array), `copyright` (text)
   - Only one entry exists

3. **Page** (Multiple Type)
   - **CRITICAL**: Must have a `url` field (text) - Visual Builder navigation depends on this
   - Fields: `title` (text), `url` (text), `sections` (modular blocks)
   - URL values: `/`, `/builder`, `/templates`, etc.
   - Each page entry represents a route in the application

### User-Defined Content Types

Users create additional content types based on their application needs. These are referenced within the Page's modular blocks.

**Example from PC Builder reference project:**

- `component` - PC parts with specifications
- `template` - Pre-built PC configurations
- `category` - Component categories
- `experience_level` - User experience levels
- `help_content` - Contextual help text

**For OTHER applications, users would create different content types, such as:**

- E-commerce: `product`, `category`, `review`, `brand`
- Blog: `article`, `author`, `tag`, `comment`
- Portfolio: `project`, `skill`, `testimonial`, `service`
- Recipe app: `recipe`, `ingredient`, `cuisine`, `chef`

**The key principle**: Create content types that model YOUR domain, then reference them in Page modular blocks.

### Modular Blocks Pattern

Pages use modular blocks for flexible composition. The block structure depends on YOUR application needs.

**Generic Pattern:**

```typescript
// Modular block with reference to user-defined content type
interface CS[BlockName]Block {
  [blockName]: {
    title: string;
    description: string;
    [referenceField]: YourContentType[] | Reference[];
  };
}
```

**Example from PC Builder reference:**

```typescript
interface CSHeroBlock {
  hero: {
    title: string;
    description: string;
    experience_levels: CSExperienceLevel[] | Reference[];
    features?: CSFeature[];
  };
}

interface CSBuilderBlock {
  builder: {
    component_group: {
      category: CSCategory[] | Reference[];
      components: CSComponent[] | Reference[];
    }[];
  };
}
```

**Example for an E-commerce app:**

```typescript
interface CSProductGridBlock {
  product_grid: {
    title: string;
    products: CSProduct[] | Reference[];
    filter_categories: CSCategory[] | Reference[];
  };
}
```

---

## Environment Variables

### Required Environment Variables

```bash
# Contentstack Core
NEXT_PUBLIC_CONTENTSTACK_API_KEY=your_api_key
NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token
NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT=your_environment
NEXT_PUBLIC_CONTENTSTACK_REGION=us|eu|azure-na|azure-eu

# Contentstack Live Preview (optional, enables preview mode)
NEXT_PUBLIC_CONTENTSTACK_PREVIEW_TOKEN=your_preview_token

# Contentstack Personalize
NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID=your_project_uid
NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_EDGE_API_URL=your_edge_api_url
```

---

## Delivery SDK Configuration

### SDK Initialization Pattern

```typescript
import contentstack from "@contentstack/delivery-sdk";
import ContentstackLivePreview, {
  IStackSdk,
} from "@contentstack/live-preview-utils";

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

const config = {
  apiKey: API_KEY,
  deliveryToken: DELIVERY_TOKEN,
  environment: ENVIRONMENT,
  host: getApiHost(),
};

if (PREVIEW_TOKEN) {
  config.live_preview = {
    enable: true,
    preview_token: PREVIEW_TOKEN,
    host: getPreviewHost(),
  };
}

export const stack = contentstack.stack(config);
```

### Query Patterns

#### Fetching by URL Field

```typescript
const result = await stack
  .contentType("page")
  .entry()
  .query()
  .where("url", QueryOperation.EQUALS, url)
  .find();
```

#### Including Reference Fields

```typescript
// Reference path must match the modular block structure
entriesQuery = entriesQuery.includeReference([
  "sections.hero.experience_levels",
  "sections.builder.component_group.category",
  "sections.builder.component_group.components",
]);
```

#### Fetching with Variants

```typescript
import Personalize from "@contentstack/personalize-edge-sdk";

if (variantParam) {
  const variantAliases = Personalize.variantParamToVariantAliases(variantParam);
  entriesQuery = entriesQuery.variants(variantAliases.join(","));
}
```

---

## Live Preview SDK Integration

### Client Component Wrapper

```typescript
"use client";

import { initLivePreview } from "@/lib/contentstack";
import { useEffect } from "react";

export function ContentstackLivePreview({ children }) {
  const livePreviewEnabled = process.env.NEXT_PUBLIC_CONTENTSTACK_PREVIEW_TOKEN;

  useEffect(() => {
    if (livePreviewEnabled) {
      initLivePreview();
    }
  }, [livePreviewEnabled]);

  return <>{children}</>;
}
```

### SDK Initialization

```typescript
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
      host: getAppHost(), // eu-app.contentstack.com, etc.
      port: 443,
    },
    editButton: {
      enable: true,
      exclude: ["outsideLivePreviewPortal"],
    },
  });
}
```

### Applying Editable Tags

```typescript
import { addEditableTags } from "@contentstack/utils";

function addEditableTagsIfPreview(entry: any, contentTypeUid: string): void {
  if (isPreviewEnabled && entry) {
    addEditableTags(entry, contentTypeUid, true, DEFAULT_LOCALE);
  }
}
```

### Using Editable Tags in Components

```tsx
// Entry has $ property with data-cslp attributes after addEditableTags
<h1 {...entry.$?.title}>{entry.title}</h1>
<p {...entry.$?.description}>{entry.description}</p>
<img src={entry.image?.url} {...entry.image?.$?.url} />
```

### Live Preview Query Parameters

```typescript
export function applyLivePreviewQuery(queryParams?: QueryParams): void {
  if (!queryParams || !PREVIEW_TOKEN) return;

  const livePreviewHash = queryParams["live_preview"];

  if (livePreviewHash) {
    stack.livePreviewQuery({
      live_preview: livePreviewHash,
      contentTypeUid: queryParams["content_type_uid"] || "",
      entryUid: queryParams["entry_uid"] || "",
      preview_timestamp: queryParams["preview_timestamp"] || "",
    });
  }
}
```

---

## Launch Edge Function (Personalization)

### Edge Function Pattern

Create `functions/[proxy].edge.js`. The edge function intercepts requests and injects variant parameters based on user attributes.

**Key customization points:**

1. `EXPERIENCE_COOKIE_NAME` - Name of cookie storing user's personalization attribute
2. `shouldPersonalize` - Which paths need personalization
3. `personalizeSdk.set({...})` - Custom attributes for audience matching (based on YOUR Personalize audiences)

```javascript
import Personalize from "@contentstack/personalize-edge-sdk";

// CUSTOMIZE: Change cookie name based on your app's personalization attribute
const EXPERIENCE_COOKIE_NAME = "your_app_experience";

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

export default async function handler(request, context) {
  const parsedUrl = new URL(request.url);
  const pathname = parsedUrl.pathname;

  // CUSTOMIZE: Define which paths should be personalized
  // PC Builder example: only "/builder" page has variants
  // Your app: specify paths that have personalized content
  const shouldPersonalize = pathname === "/builder";

  if (!shouldPersonalize) {
    return fetch(request);
  }

  const edgeApiUrl =
    context.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_EDGE_API_URL;
  const projectUid =
    context.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID;

  if (edgeApiUrl) {
    Personalize.setEdgeApiUrl(edgeApiUrl);
  }

  try {
    Personalize.reset();

    const personalizeSdk = await Personalize.init(projectUid, { request });

    // Get user's experience level from cookie
    const experienceLevel = getCookieValue(request, EXPERIENCE_COOKIE_NAME);

    if (experienceLevel) {
      // CUSTOMIZE: Set custom attribute for audience matching
      // The attribute name must match what you configured in Personalize audiences
      // PC Builder uses "experience_level", your app might use "user_tier", "region", etc.
      personalizeSdk.set({ experience_level: experienceLevel });
    }

    // Get variant parameter based on audience match
    const variantParam = personalizeSdk.getVariantParam();

    // Inject variant param into request URL
    parsedUrl.searchParams.set(
      personalizeSdk.VARIANT_QUERY_PARAM,
      variantParam
    );

    const modifiedRequest = new Request(parsedUrl.toString(), request);
    const response = await fetch(modifiedRequest);
    const modifiedResponse = new Response(response.body, response);

    // Persist personalization state in response
    personalizeSdk.addStateToResponse(modifiedResponse);
    modifiedResponse.headers.set("cache-control", "no-store");

    return modifiedResponse;
  } catch (error) {
    return fetch(request);
  }
}
```

---

## SSR Page Pattern with Variants

### Force Dynamic Pages

```typescript
import Personalize from "@contentstack/personalize-edge-sdk";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;

  // Extract variant param injected by edge function
  const variantParam = params[Personalize.VARIANT_QUERY_PARAM];

  // Fetch page with variants
  const pageData = await getPageByUrl("/builder", variantParam, params);

  return <PageClient data={pageData} />;
}
```

---

## Variant Creation Script Pattern

### Metadata and Changeset Rules

When updating variants programmatically:

1. **Existing Fields**: Preserve the `_metadata.uid` from the base entry
2. **New Fields**: Generate UUID with `$new_${uuid}` pattern
3. **Array Fields**: Each array item needs its own `_metadata.uid`

### Changeset Generation

```javascript
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
```

### Variant Update Payload Structure

```javascript
const payload = {
  entry: {
    description: variantData.description,
    specifications: specifications, // with _metadata.uid preserved/generated
    compatibility_notes: variantData.compatibility_notes,
    _variant: {
      _change_set: changeSet, // array of field paths being changed
    },
  },
};
```

---

## Next.js Configuration

### next.config.ts

```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "eu-images.contentstack.com",
        pathname: "/v3/assets/**",
      },
      {
        protocol: "https",
        hostname: "images.contentstack.com",
        pathname: "/v3/assets/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
    ];
  },
};
```

---

## Required Dependencies

```json
{
  "dependencies": {
    "@contentstack/delivery-sdk": "^4.10.3",
    "@contentstack/live-preview-utils": "^4.1.2",
    "@contentstack/personalize-edge-sdk": "^1.0.19",
    "@contentstack/utils": "^1.6.3",
    "next": "16.0.7",
    "react": "19.2.0"
  }
}
```

---

## MCP Server for Entry Creation

Configure in `.cursor/mcp.json`:

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

Authenticate: `npx @contentstack/mcp --auth`

---

## Best Practices

1. **Always use `force-dynamic`** on pages that need variants
2. **Pass `searchParams` to all query functions** for live preview to work
3. **Apply editable tags** after fetching entries in preview mode
4. **Include reference paths** that match your modular block structure
5. **Test with dry-run mode** before updating variants programmatically
6. **Publish all variants** to CDN after creation
7. **Use the URL field** in Page content type for Visual Builder navigation
