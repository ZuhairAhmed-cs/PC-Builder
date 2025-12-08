# DXP PC Builder

A modern, personalized PC building application demonstrating Contentstack's Digital Experience Platform capabilities with Next.js SSR, Personalize variants, and Live Preview SDK integration.

**🚀 Live Demo**: [https://pc-builder.eu-contentstackapps.com/](https://pc-builder.eu-contentstackapps.com/)

**📦 Repository**: [https://github.com/ZuhairAhmed-cs/PC-Builder.git](https://github.com/ZuhairAhmed-cs/PC-Builder.git)

![Architecture Diagram](./ARCHITECTURE.png)

## Features

- **Experience-Based Personalization**: Tailored component descriptions and specifications based on user experience level (Beginner, Intermediate, Expert)
- **Live Preview & Visual Builder**: Real-time content editing with Contentstack's Visual Builder
- **3D PC Visualization**: Interactive 3D model viewer using Google Model Viewer
- **User Authentication**: Email/password authentication with Supabase
- **Build Management**: Save, edit, and share PC builds with unique shareable links
- **Automated Email Workflows**: Parts list email delivery via Contentstack Automate
- **Compatibility Checking**: Real-time validation of component compatibility (CPU socket, power requirements)
- **Price Tracking**: Track total build cost with retailer links

## Tech Stack

| Category             | Technology                                     |
| -------------------- | ---------------------------------------------- |
| **Frontend**         | Next.js 16, React 19, TypeScript, Tailwind CSS |
| **CMS**              | Contentstack (Headless CMS)                    |
| **Personalization**  | Contentstack Personalize Edge SDK              |
| **Live Preview**     | Contentstack Live Preview SDK                  |
| **Email Automation** | Contentstack Automate                          |
| **Deployment**       | Contentstack Launch (Edge Functions)           |
| **Database**         | Supabase (PostgreSQL)                          |
| **Authentication**   | Supabase Auth                                  |
| **3D Rendering**     | Google Model Viewer                            |
| **State Management** | Zustand                                        |

## Prerequisites

- Node.js 18+ and npm
- Contentstack account with:
  - Stack configured with content types
  - Personalize project with experiences
  - Launch deployment connected
- Supabase project for authentication and builds storage

## Environment Variables

Create a `.env.local` file:

```bash
# Contentstack Core
NEXT_PUBLIC_CONTENTSTACK_API_KEY=your_api_key
NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token
NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT=your_environment
NEXT_PUBLIC_CONTENTSTACK_REGION=eu  # us, eu, azure-na, azure-eu

# Contentstack Live Preview
NEXT_PUBLIC_CONTENTSTACK_PREVIEW_TOKEN=your_preview_token

# Contentstack Personalize
NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID=your_project_uid
NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_EDGE_API_URL=your_edge_api_url

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3005
```

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── builds/           # Build CRUD API routes
│   │   └── experience/       # Experience level API
│   ├── auth/                 # Auth pages (signin, signup, reset, callback)
│   ├── builder/              # PC builder interface (personalized)
│   ├── dashboard/            # User dashboard (saved builds)
│   ├── share/[token]/        # Public shared build viewer
│   ├── templates/            # Pre-built PC templates
│   ├── layout.tsx            # Root layout with Live Preview
│   └── page.tsx              # Home page (experience selector)
├── components/
│   ├── 3d/                   # 3D model viewer components
│   ├── dashboard/            # Dashboard components
│   ├── layout/               # Header, Footer (server components)
│   ├── share/                # Shared build components
│   ├── ui/                   # Reusable UI components (shadcn/ui)
│   └── contentstack-live-preview.tsx  # Live Preview client wrapper
├── dxp-guide/                # DXP implementation documentation
│   ├── README.md             # Guide overview
│   ├── cursorrules.md        # AI assistant rules (copy to .cursorrules)
│   └── agents.md             # Implementation guide (use as Cursor chat prompt)
├── functions/
│   └── [proxy].edge.js       # Launch edge function (personalization)
├── lib/
│   ├── contentstack/         # CMS integration
│   │   ├── client.ts         # SDK initialization
│   │   ├── queries.ts        # Data fetching functions
│   │   ├── adapter.ts        # CS → App type adapters
│   │   └── types.ts          # Contentstack type definitions
│   ├── supabase/             # Supabase client configuration
│   ├── auth.ts               # Authentication helpers
│   └── compatibility.ts      # Component compatibility logic
├── scripts/
│   └── update-variants.js    # Variant creation/update script
├── store/
│   └── build-store.ts        # Zustand build state
└── types/
    └── index.ts              # Application type definitions
```

## Content Model

### Base Content Types (Required for Live Preview)

| Content Type | Type     | Purpose                                          |
| ------------ | -------- | ------------------------------------------------ |
| `header`     | Single   | Site navigation, logo                            |
| `footer`     | Single   | Footer links, copyright                          |
| `page`       | Multiple | Page content with `url` field for Visual Builder |

### Application Content Types

| Content Type       | Purpose                                                 |
| ------------------ | ------------------------------------------------------- |
| `component`        | PC parts (CPU, GPU, RAM, etc.) with specifications      |
| `category`         | Component categories with icons and descriptions        |
| `template`         | Pre-built PC configurations                             |
| `experience_level` | User experience levels (Beginner, Intermediate, Expert) |
| `help_content`     | Contextual help tooltips                                |

### Personalization

Three experience levels with variant content:

| Level        | Audience Condition                | Content Style                      |
| ------------ | --------------------------------- | ---------------------------------- |
| Beginner     | `experience_level = beginner`     | Simple descriptions, basic specs   |
| Intermediate | `experience_level = intermediate` | Balanced detail, performance focus |
| Expert       | `experience_level = expert`       | Technical specs, advanced details  |

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local` and fill in your credentials.

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3005`

### 4. Deploy to Launch

1. Connect repository to Contentstack Launch
2. Configure environment variables in Launch settings
3. Edge function deploys automatically from `functions/[proxy].edge.js`

## Key Features Explained

### Personalization Flow

1. User selects experience level on home page
2. Cookie `pc_builder_experience` stores selection
3. Edge function reads cookie on subsequent requests
4. Personalize SDK matches user to audience
5. Variant parameter injected into request URL
6. Server component fetches content with variant modifier
7. Personalized descriptions and specs rendered

### Live Preview Integration

1. `ContentstackLivePreview` component initializes SDK in layout
2. Server components fetch entries with `queryParams`
3. `addEditableTags` adds `$` property to entries
4. Components spread `{...entry.$?.fieldName}` for inline editing
5. Visual Builder enables real-time content updates

### Build Management

1. Users create accounts via Supabase Auth
2. Builds stored in Supabase with RLS policies
3. Public builds get shareable token URLs
4. View counts tracked for public builds

## Documentation

For building your own DXP application using these patterns, see:

| File                                             | Purpose                | How to Use                                                |
| ------------------------------------------------ | ---------------------- | --------------------------------------------------------- |
| **[DXP Guide README](./dxp-guide/README.md)**    | Overview & quick start | Read for understanding                                    |
| **[cursorrules.md](./dxp-guide/cursorrules.md)** | AI assistant rules     | Copy to `.cursorrules` in your project root               |
| **[agents.md](./dxp-guide/agents.md)**           | Implementation guide   | **Paste as prompt in Cursor chat** for guided development |

### Using agents.md as a Cursor Prompt

The `agents.md` file is designed to be used as a **prompt in Cursor chat**:

1. Open Cursor chat (`Cmd/Ctrl + L`)
2. Copy the contents of `dxp-guide/agents.md`
3. Paste it as context for your conversation
4. Ask Cursor to help you build your DXP application

This gives the AI full context about Contentstack patterns, Live Preview, Personalize, and Launch integration.

## Scripts

```bash
# Development
npm run dev          # Start dev server on port 3005

# Build
npm run build        # Production build
npm run start        # Start production server

```

## License

MIT

## Links

- [Contentstack Documentation](https://www.contentstack.com/docs)
- [Live Preview SDK](https://www.contentstack.com/docs/developers/set-up-live-preview)
- [Personalize SDK](https://www.contentstack.com/docs/developers/personalize)
- [Launch Documentation](https://www.contentstack.com/docs/developers/launch)
