import { QueryOperation } from "@contentstack/delivery-sdk";
import Personalize from "@contentstack/personalize-edge-sdk";
import { stack, CONTENT_TYPES, isContentstackConfigured } from "./client";
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

// ============================================
// Page Queries (Main data source)
// ============================================

/**
 * Fetch a page by URL with appropriate references included
 * This is the main query function - pages contain all data via modular blocks
 *
 * @param url - The page URL to fetch
 * @param variantParam - Optional variant parameter from Personalize (e.g., "a_0,b_1")
 */
export async function getPageByUrl(
  url: string,
  variantParam?: string
): Promise<CSPage | null> {
  if (!isContentstackConfigured()) {
    console.warn("Contentstack is not configured");
    return null;
  }

  try {
    // Start with entry query
    let entriesQuery = stack.contentType(CONTENT_TYPES.PAGE).entry();

    // Add reference includes based on URL/page type
    // includeReference must be called on Entries, not Query
    // For modular blocks, pass array of reference paths
    if (url === "/") {
      // Home page - Hero block with experience_levels
      entriesQuery = entriesQuery.includeReference([
        "sections.hero.experience_levels",
      ]);
    } else if (url === "/builder") {
      // Builder page - Builder block with categories and components
      entriesQuery = entriesQuery.includeReference([
        "sections.builder.component_group.category",
        "sections.builder.component_group.components",
      ]);
    } else if (url === "/templates") {
      // Templates page - Template block with template references and their components
      entriesQuery = entriesQuery.includeReference([
        "sections.template.reference",
        "sections.template.reference.components",
      ]);
    }

    // Apply variant parameter if provided
    // Convert variant param to variant aliases and use .variants() method
    if (variantParam) {
      const variantAliases =
        Personalize.variantParamToVariantAliases(variantParam);
      entriesQuery = entriesQuery.variants(variantAliases.join(","));
    }

    // Now apply query filters
    // Use QueryOperation.EQUALS for proper equality check
    const result = await entriesQuery
      .query()
      .where("url", QueryOperation.EQUALS, url)
      .find();

    return (result.entries?.[0] || null) as CSPage | null;
  } catch (error) {
    console.error(`Error fetching page ${url}:`, error);
    return null;
  }
}

// ============================================
// Header & Footer Queries (Layout singletons)
// ============================================

/**
 * Fetch the header singleton
 */
export async function getHeader(): Promise<CSHeader | null> {
  if (!isContentstackConfigured()) {
    console.warn("Contentstack is not configured");
    return null;
  }

  try {
    const result = await stack.contentType(CONTENT_TYPES.HEADER).entry().find();

    return (result.entries?.[0] || null) as CSHeader | null;
  } catch (error) {
    console.error("Error fetching header:", error);
    return null;
  }
}

/**
 * Fetch the footer singleton
 */
export async function getFooter(): Promise<CSFooter | null> {
  if (!isContentstackConfigured()) {
    console.warn("Contentstack is not configured");
    return null;
  }

  try {
    const result = await stack.contentType(CONTENT_TYPES.FOOTER).entry().find();

    return (result.entries?.[0] || null) as CSFooter | null;
  } catch (error) {
    console.error("Error fetching footer:", error);
    return null;
  }
}

// ============================================
// Direct Content Type Queries (for specific needs)
// ============================================

/**
 * Fetch all components
 */
export async function getAllComponents(): Promise<CSComponent[]> {
  if (!isContentstackConfigured()) {
    console.warn("Contentstack is not configured");
    return [];
  }

  try {
    const result = await stack
      .contentType(CONTENT_TYPES.COMPONENT)
      .entry()
      .find();

    return (result.entries || []) as CSComponent[];
  } catch (error) {
    console.error("Error fetching components:", error);
    return [];
  }
}

/**
 * Fetch components by category
 */
export async function getComponentsByCategory(
  category: string
): Promise<CSComponent[]> {
  if (!isContentstackConfigured()) {
    console.warn("Contentstack is not configured");
    return [];
  }

  try {
    const result = await stack
      .contentType(CONTENT_TYPES.COMPONENT)
      .entry()
      .query()
      .where("category", QueryOperation.EQUALS, category)
      .find();

    return (result.entries || []) as CSComponent[];
  } catch (error) {
    console.error(`Error fetching components for category ${category}:`, error);
    return [];
  }
}

/**
 * Fetch a single component by UID
 */
export async function getComponentByUid(
  uid: string
): Promise<CSComponent | null> {
  if (!isContentstackConfigured()) {
    console.warn("Contentstack is not configured");
    return null;
  }

  try {
    const result = await stack
      .contentType(CONTENT_TYPES.COMPONENT)
      .entry(uid)
      .fetch();

    return result as CSComponent;
  } catch (error) {
    console.error(`Error fetching component ${uid}:`, error);
    return null;
  }
}

/**
 * Fetch all experience levels
 */
export async function getAllExperienceLevels(): Promise<CSExperienceLevel[]> {
  if (!isContentstackConfigured()) {
    console.warn("Contentstack is not configured");
    return [];
  }

  try {
    const result = await stack
      .contentType(CONTENT_TYPES.EXPERIENCE_LEVEL)
      .entry()
      .find();

    return (result.entries || []) as CSExperienceLevel[];
  } catch (error) {
    console.error("Error fetching experience levels:", error);
    return [];
  }
}

/**
 * Fetch all templates with component references
 */
export async function getAllTemplates(): Promise<CSTemplate[]> {
  if (!isContentstackConfigured()) {
    console.warn("Contentstack is not configured");
    return [];
  }

  try {
    const result = await stack
      .contentType(CONTENT_TYPES.TEMPLATE)
      .entry()
      .includeReference("components")
      .find();

    return (result.entries || []) as CSTemplate[];
  } catch (error) {
    console.error("Error fetching templates:", error);
    return [];
  }
}

// ============================================
// Category Queries
// ============================================

/**
 * Fetch all categories sorted by sort_order
 */
export async function getAllCategories(): Promise<CSCategory[]> {
  if (!isContentstackConfigured()) {
    console.warn("Contentstack is not configured");
    return [];
  }

  try {
    const result = await stack
      .contentType(CONTENT_TYPES.CATEGORY)
      .entry()
      .find();

    // Sort by sort_order field
    const categories = (result.entries || []) as CSCategory[];
    return categories.sort(
      (a, b) => parseInt(a.sort_order || "0") - parseInt(b.sort_order || "0")
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// ============================================
// Help Content Queries
// ============================================

/**
 * Fetch all help content
 */
export async function getAllHelpContent(): Promise<CSHelpContent[]> {
  if (!isContentstackConfigured()) {
    console.warn("Contentstack is not configured");
    return [];
  }

  try {
    const result = await stack
      .contentType(CONTENT_TYPES.HELP_CONTENT)
      .entry()
      .find();

    return (result.entries || []) as CSHelpContent[];
  } catch (error) {
    console.error("Error fetching help content:", error);
    return [];
  }
}

/**
 * Fetch help content by category
 */
export async function getHelpContentByCategory(
  category: string
): Promise<CSHelpContent[]> {
  if (!isContentstackConfigured()) {
    console.warn("Contentstack is not configured");
    return [];
  }

  try {
    const result = await stack
      .contentType(CONTENT_TYPES.HELP_CONTENT)
      .entry()
      .query()
      .where("category", QueryOperation.EQUALS, category)
      .find();

    return (result.entries || []) as CSHelpContent[];
  } catch (error) {
    console.error(
      `Error fetching help content for category ${category}:`,
      error
    );
    return [];
  }
}

/**
 * Fetch help content by help_id
 */
export async function getHelpContentById(
  helpId: string
): Promise<CSHelpContent | null> {
  if (!isContentstackConfigured()) {
    console.warn("Contentstack is not configured");
    return null;
  }

  try {
    const result = await stack
      .contentType(CONTENT_TYPES.HELP_CONTENT)
      .entry()
      .query()
      .where("help_id", QueryOperation.EQUALS, helpId)
      .find();

    return (result.entries?.[0] || null) as CSHelpContent | null;
  } catch (error) {
    console.error(`Error fetching help content ${helpId}:`, error);
    return null;
  }
}
