# Contentstack Digital Experience Platform (DXP) Guide

This folder contains comprehensive documentation for building Next.js SSR applications with Contentstack CMS, Personalize variants, and Live Preview SDK integration.

## Files in This Directory

| File                                 | Purpose              | How to Use                                          |
| ------------------------------------ | -------------------- | --------------------------------------------------- |
| [`cursorrules.md`](./cursorrules.md) | AI Assistant Rules   | Copy to `.cursorrules` in your project root         |
| [`agents.md`](./agents.md)           | Implementation Guide | **Paste as prompt in Cursor chat** or read manually |

---

## Quick Start

### Option 1: Use as Cursor Chat Prompt (Recommended)

The `agents.md` file is designed to be **pasted directly into Cursor chat** as context:

1. Open Cursor chat (`Cmd/Ctrl + L`)
2. Copy the entire contents of [`agents.md`](./agents.md)
3. Paste it into the chat
4. Ask: _"Help me build a [your app type] using these DXP patterns"_

The AI will now have full context about:

- Contentstack content modeling
- Live Preview SDK integration
- Personalize variant configuration
- Launch edge function setup
- SSR page patterns with variants

### Option 2: Copy Rules File for Background Context

For ongoing AI assistance without pasting each time:

```bash
cp dxp-guide/cursorrules.md .cursorrules
```

The AI assistant will automatically use these rules when helping you.

### Option 3: Manual Development

Read [`agents.md`](./agents.md) directly and follow the step-by-step instructions.

---

## Reference Implementation

These guides are based on patterns extracted from a working project:

|                |                                                                      |
| -------------- | -------------------------------------------------------------------- |
| **Live Demo**  | https://pc-builder.eu-contentstackapps.com/                          |
| **Repository** | https://github.com/ZuhairAhmed-cs/PC-Builder.git                     |
| **Features**   | Personalization, Live Preview, 3D Visualization, Auth, Build Sharing |

---

## How to Adapt These Patterns

The examples use PC Builder terminology. Adapt to your domain:

### Content Type Mapping

| PC Builder         | E-commerce  | Blog           | Portfolio     |
| ------------------ | ----------- | -------------- | ------------- |
| `component`        | `product`   | `article`      | `project`     |
| `category`         | `category`  | `tag`          | `skill`       |
| `template`         | `bundle`    | `series`       | `service`     |
| `experience_level` | `user_tier` | `subscription` | `client_type` |

### Personalization Attribute Mapping

| PC Builder                       | Other Domains                                |
| -------------------------------- | -------------------------------------------- |
| `experience_level: beginner`     | `user_tier: free`, `subscription: basic`     |
| `experience_level: intermediate` | `user_tier: premium`, `subscription: pro`    |
| `experience_level: expert`       | `user_tier: vip`, `subscription: enterprise` |

---

## Architecture Overview

![Architecture Diagram](../ARCHITECTURE.png)

The diagram shows the complete data flow:

1. **User Request** - Browser sends request with experience cookie
2. **Edge Processing** - Contentstack Launch resolves variant
3. **SSR Rendering** - Next.js fetches personalized content
4. **Content Delivery** - Contentstack CMS returns variant data
5. **User Interaction** - User saves build
6. **Data Persistence** - Supabase stores user data
7. **Email Trigger** - Contentstack Automate sends parts list

---

## Key Concepts

### 1. Base Content Types (Required)

Every DXP project needs these three content types for Live Preview SDK:

- **Header** (Single) - Site navigation
- **Footer** (Single) - Site footer
- **Page** (Multiple) - Must have `url` field for Visual Builder navigation

### 2. User-Defined Content Types

Create content types specific to your domain, referenced in Page modular blocks.

### 3. Modular Blocks

Flexible page composition using blocks that reference your content types.

### 4. Variant Resolution Flow

1. User visits page → Edge function intercepts
2. Edge function reads user attributes (cookies/headers)
3. Personalize SDK matches user to audience
4. Variant parameter injected into request
5. Next.js fetches content with variant modifier
6. Personalized content rendered

### 5. Live Preview Integration

- SDK initialized in client component
- `addEditableTags` applied to fetched entries
- `$` property spreads `data-cslp` attributes to elements
- Visual Builder enables inline editing

---

## Troubleshooting

### Variants Not Loading

- Check `force-dynamic` is set on page
- Verify edge function is deployed
- Confirm Personalize experience is published
- Check custom attributes match audience conditions

### Live Preview Not Working

- Verify `PREVIEW_TOKEN` environment variable
- Check `ContentstackLivePreview` component in layout
- Ensure `applyLivePreviewQuery` called in queries
- Confirm preview host matches region

### Reference Fields Empty

- Add correct `includeReference` paths
- Path format: `sections.[blockName].[field]`
- For nested: `sections.block.group.field`

---

## Support

- **Contentstack Docs**: https://www.contentstack.com/docs
- **Live Preview SDK**: https://www.contentstack.com/docs/developers/set-up-live-preview
- **Personalize SDK**: https://www.contentstack.com/docs/developers/personalize
- **Launch Docs**: https://www.contentstack.com/docs/developers/launch
