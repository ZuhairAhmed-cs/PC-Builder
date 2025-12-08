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
import type {
  CSComponent,
  CSExperienceLevel,
  CSTemplate,
  CSPage,
  CSHeader,
  CSFooter,
  CSCategory,
  CSHelpContent,
} from "./types";

const isPreviewEnabled = Boolean(PREVIEW_TOKEN);

function addEditableTagsIfPreview(entry: any, contentTypeUid: string): void {
  if (isPreviewEnabled && entry) {
    addEditableTags(entry, contentTypeUid, true, DEFAULT_LOCALE);
  }
}

export async function getPageByUrl(
  url: string,
  variantParam?: string,
  queryParams?: QueryParams
): Promise<CSPage | null> {
  if (!isContentstackConfigured()) {
    console.warn("Contentstack is not configured");
    return null;
  }

  applyLivePreviewQuery(queryParams);

  try {
    let entriesQuery = stack.contentType(CONTENT_TYPES.PAGE).entry();

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

    if (variantParam) {
      const variantAliases =
        Personalize.variantParamToVariantAliases(variantParam);
      entriesQuery = entriesQuery.variants(variantAliases.join(","));
    }

    const result = await entriesQuery
      .query()
      .where("url", QueryOperation.EQUALS, url)
      .find();

    const entry = result.entries?.[0] as CSPage | null;
    if (entry) {
      addEditableTagsIfPreview(entry, CONTENT_TYPES.PAGE);
    }
    return entry;
  } catch (error) {
    console.error(`Error fetching page ${url}:`, error);
    return null;
  }
}

export async function getHeader(
  queryParams?: QueryParams
): Promise<CSHeader | null> {
  if (!isContentstackConfigured()) {
    console.warn("Contentstack is not configured");
    return null;
  }

  applyLivePreviewQuery(queryParams);

  try {
    const result = await stack.contentType(CONTENT_TYPES.HEADER).entry().find();

    const entry = result.entries?.[0] as CSHeader | null;
    if (entry) {
      addEditableTagsIfPreview(entry, CONTENT_TYPES.HEADER);
    }
    return entry;
  } catch (error) {
    console.error("Error fetching header:", error);
    return null;
  }
}

export async function getFooter(
  queryParams?: QueryParams
): Promise<CSFooter | null> {
  if (!isContentstackConfigured()) {
    console.warn("Contentstack is not configured");
    return null;
  }

  applyLivePreviewQuery(queryParams);

  try {
    const result = await stack.contentType(CONTENT_TYPES.FOOTER).entry().find();

    const entry = result.entries?.[0] as CSFooter | null;
    if (entry) {
      addEditableTagsIfPreview(entry, CONTENT_TYPES.FOOTER);
    }
    return entry;
  } catch (error) {
    console.error("Error fetching footer:", error);
    return null;
  }
}

export async function getAllComponents(
  queryParams?: QueryParams
): Promise<CSComponent[]> {
  if (!isContentstackConfigured()) {
    console.warn("Contentstack is not configured");
    return [];
  }

  applyLivePreviewQuery(queryParams);

  try {
    const result = await stack
      .contentType(CONTENT_TYPES.COMPONENT)
      .entry()
      .find();

    const entries = (result.entries || []) as CSComponent[];
    entries.forEach((entry) => {
      addEditableTagsIfPreview(entry, CONTENT_TYPES.COMPONENT);
    });
    return entries;
  } catch (error) {
    console.error("Error fetching components:", error);
    return [];
  }
}

export async function getComponentsByCategory(
  category: string,
  queryParams?: QueryParams
): Promise<CSComponent[]> {
  if (!isContentstackConfigured()) {
    console.warn("Contentstack is not configured");
    return [];
  }

  applyLivePreviewQuery(queryParams);

  try {
    const result = await stack
      .contentType(CONTENT_TYPES.COMPONENT)
      .entry()
      .query()
      .where("category", QueryOperation.EQUALS, category)
      .find();

    const entries = (result.entries || []) as CSComponent[];
    entries.forEach((entry) => {
      addEditableTagsIfPreview(entry, CONTENT_TYPES.COMPONENT);
    });
    return entries;
  } catch (error) {
    console.error(`Error fetching components for category ${category}:`, error);
    return [];
  }
}

export async function getComponentByUid(
  uid: string,
  queryParams?: QueryParams
): Promise<CSComponent | null> {
  if (!isContentstackConfigured()) {
    console.warn("Contentstack is not configured");
    return null;
  }

  applyLivePreviewQuery(queryParams);

  try {
    const result = await stack
      .contentType(CONTENT_TYPES.COMPONENT)
      .entry(uid)
      .fetch();

    const entry = result as CSComponent;
    if (entry) {
      addEditableTagsIfPreview(entry, CONTENT_TYPES.COMPONENT);
    }
    return entry;
  } catch (error) {
    console.error(`Error fetching component ${uid}:`, error);
    return null;
  }
}

export async function getAllExperienceLevels(
  queryParams?: QueryParams
): Promise<CSExperienceLevel[]> {
  if (!isContentstackConfigured()) {
    console.warn("Contentstack is not configured");
    return [];
  }

  applyLivePreviewQuery(queryParams);

  try {
    const result = await stack
      .contentType(CONTENT_TYPES.EXPERIENCE_LEVEL)
      .entry()
      .find();

    const entries = (result.entries || []) as CSExperienceLevel[];
    entries.forEach((entry) => {
      addEditableTagsIfPreview(entry, CONTENT_TYPES.EXPERIENCE_LEVEL);
    });
    return entries;
  } catch (error) {
    console.error("Error fetching experience levels:", error);
    return [];
  }
}

export async function getAllTemplates(
  queryParams?: QueryParams
): Promise<CSTemplate[]> {
  if (!isContentstackConfigured()) {
    console.warn("Contentstack is not configured");
    return [];
  }

  applyLivePreviewQuery(queryParams);

  try {
    const result = await stack
      .contentType(CONTENT_TYPES.TEMPLATE)
      .entry()
      .includeReference("components")
      .find();

    const entries = (result.entries || []) as CSTemplate[];
    entries.forEach((entry) => {
      addEditableTagsIfPreview(entry, CONTENT_TYPES.TEMPLATE);
    });
    return entries;
  } catch (error) {
    console.error("Error fetching templates:", error);
    return [];
  }
}

export async function getAllCategories(
  queryParams?: QueryParams
): Promise<CSCategory[]> {
  if (!isContentstackConfigured()) {
    console.warn("Contentstack is not configured");
    return [];
  }

  applyLivePreviewQuery(queryParams);

  try {
    const result = await stack
      .contentType(CONTENT_TYPES.CATEGORY)
      .entry()
      .find();

    const categories = (result.entries || []) as CSCategory[];
    categories.forEach((entry) => {
      addEditableTagsIfPreview(entry, CONTENT_TYPES.CATEGORY);
    });
    return categories.sort(
      (a, b) => parseInt(a.sort_order || "0") - parseInt(b.sort_order || "0")
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getAllHelpContent(
  queryParams?: QueryParams
): Promise<CSHelpContent[]> {
  if (!isContentstackConfigured()) {
    console.warn("Contentstack is not configured");
    return [];
  }

  applyLivePreviewQuery(queryParams);

  try {
    const result = await stack
      .contentType(CONTENT_TYPES.HELP_CONTENT)
      .entry()
      .find();

    const entries = (result.entries || []) as CSHelpContent[];
    entries.forEach((entry) => {
      addEditableTagsIfPreview(entry, CONTENT_TYPES.HELP_CONTENT);
    });
    return entries;
  } catch (error) {
    console.error("Error fetching help content:", error);
    return [];
  }
}

export async function getHelpContentByCategory(
  category: string,
  queryParams?: QueryParams
): Promise<CSHelpContent[]> {
  if (!isContentstackConfigured()) {
    console.warn("Contentstack is not configured");
    return [];
  }

  applyLivePreviewQuery(queryParams);

  try {
    const result = await stack
      .contentType(CONTENT_TYPES.HELP_CONTENT)
      .entry()
      .query()
      .where("category", QueryOperation.EQUALS, category)
      .find();

    const entries = (result.entries || []) as CSHelpContent[];
    entries.forEach((entry) => {
      addEditableTagsIfPreview(entry, CONTENT_TYPES.HELP_CONTENT);
    });
    return entries;
  } catch (error) {
    console.error(
      `Error fetching help content for category ${category}:`,
      error
    );
    return [];
  }
}

export async function getHelpContentById(
  helpId: string,
  queryParams?: QueryParams
): Promise<CSHelpContent | null> {
  if (!isContentstackConfigured()) {
    console.warn("Contentstack is not configured");
    return null;
  }

  applyLivePreviewQuery(queryParams);

  try {
    const result = await stack
      .contentType(CONTENT_TYPES.HELP_CONTENT)
      .entry()
      .query()
      .where("help_id", QueryOperation.EQUALS, helpId)
      .find();

    const entry = result.entries?.[0] as CSHelpContent | null;
    if (entry) {
      addEditableTagsIfPreview(entry, CONTENT_TYPES.HELP_CONTENT);
    }
    return entry;
  } catch (error) {
    console.error(`Error fetching help content ${helpId}:`, error);
    return null;
  }
}
