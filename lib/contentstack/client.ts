import contentstack from "@contentstack/delivery-sdk";
import ContentstackLivePreview, {
  IStackSdk,
} from "@contentstack/live-preview-utils";

export const API_KEY = process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY || "";
const DELIVERY_TOKEN =
  process.env.NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN || "";
export const ENVIRONMENT =
  process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT || "dev";
export const PREVIEW_TOKEN =
  process.env.NEXT_PUBLIC_CONTENTSTACK_PREVIEW_TOKEN || "";
export const REGION = process.env.NEXT_PUBLIC_CONTENTSTACK_REGION || "eu";

export const DEFAULT_LOCALE = "en-us";

export type QueryParams = Record<string, string | string[] | undefined>;

const LIVE_PREVIEW_HASH_PARAM = "live_preview";
const CONTENT_TYPE_UID_PARAM = "content_type_uid";
const ENTRY_UID_PARAM = "entry_uid";
const PREVIEW_TIMESTAMP_PARAM = "preview_timestamp";

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

function initializeContentstackSdk() {
  const config: Parameters<typeof contentstack.stack>[0] = {
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

  return contentstack.stack(config);
}

export const stack = initializeContentstackSdk();

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

export function isLivePreviewMode(queryParams?: QueryParams): boolean {
  if (!queryParams) return false;
  return Boolean(queryParams[LIVE_PREVIEW_HASH_PARAM]);
}

export const onEntryChange = ContentstackLivePreview.onEntryChange;

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

export function isContentstackConfigured(): boolean {
  return Boolean(API_KEY && DELIVERY_TOKEN && ENVIRONMENT);
}
