import contentstack from "@contentstack/delivery-sdk";

// Environment variables for Contentstack configuration
const API_KEY = process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY || "";
const DELIVERY_TOKEN =
  process.env.NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN || "";
const ENVIRONMENT = process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT || "dev";
const PREVIEW_TOKEN = process.env.NEXT_PUBLIC_CONTENTSTACK_PREVIEW_TOKEN || "";
const REGION = process.env.NEXT_PUBLIC_CONTENTSTACK_REGION || "eu";

// Get the appropriate host based on region
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

// Create a new stack instance
export function createStack(enableLivePreview = false) {
  const config: Parameters<typeof contentstack.stack>[0] = {
    apiKey: API_KEY,
    deliveryToken: DELIVERY_TOKEN,
    environment: ENVIRONMENT,
    host: getApiHost(),
  };

  // Enable live preview if requested and token is available
  if (enableLivePreview && PREVIEW_TOKEN) {
    config.live_preview = {
      enable: true,
      preview_token: PREVIEW_TOKEN,
      host: getPreviewHost(),
    };
  }

  return contentstack.stack(config);
}

// Default stack instance for client-side use
export const stack = createStack(false);

// Stack with live preview enabled
export const stackWithPreview = createStack(true);

// Content type UIDs
export const CONTENT_TYPES = {
  COMPONENT: "component",
  EXPERIENCE_LEVEL: "experience_level",
  TEMPLATE: "template",
  PAGE: "page",
  HEADER: "header",
  FOOTER: "footer",
  CATEGORY: "category",
  HELP_CONTENT: "help_content",
} as const;

// Check if Contentstack is configured
export function isContentstackConfigured(): boolean {
  return Boolean(API_KEY && DELIVERY_TOKEN && ENVIRONMENT);
}
