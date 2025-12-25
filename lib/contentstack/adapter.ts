/**
 * Data Adapter
 * Transforms Contentstack entries to application types
 */

import type {
  CSComponent,
  CSExperienceLevel,
  CSTemplate,
  CSHeader,
  CSFooter,
  CSPage,
  CSHeroBlock,
  CSTemplateBlock,
  CSBuilderBlock,
  CSCategory,
  CSHelpContent,
} from "./types";

import {
  isHeroBlock,
  isTemplateBlock,
  isBuilderBlock,
  areExperienceLevelsResolved,
  areComponentsResolved,
  areTemplatesResolved,
  areCategoriesResolved,
} from "./types";

import type {
  PCComponent,
  ExperienceLevel,
  BuildTemplate,
  StockStatus,
  ComponentCategory,
  SpecificationSet,
  LevelContent,
  CategoryInfo,
} from "@/types";

// ============================================
// Experience Level Adapter
// ============================================

/**
 * Derive experience level ID from title
 */
function deriveExperienceLevelId(
  title: string
): "beginner" | "intermediate" | "expert" {
  const name = title.toLowerCase();
  if (name.includes("beginner") || name.includes("first")) return "beginner";
  if (name.includes("expert") || name.includes("advanced")) return "expert";
  return "intermediate";
}

/**
 * Convert CSExperienceLevel to ExperienceLevel
 */
export function adaptExperienceLevel(cs: CSExperienceLevel): ExperienceLevel {
  const id = deriveExperienceLevelId(cs.title);

  return {
    id,
    displayName: cs.title,
    description: cs.description || "",
    icon: cs.icon || "🔧",
    tagline: cs.tagline || "",
    features: cs.pointers || [],
  };
}

// ============================================
// Component Adapter
// ============================================

/**
 * Derive stock status from product links
 */
function deriveStockStatus(
  productLinks?: { stock_status: string }[]
): StockStatus {
  if (!productLinks || productLinks.length === 0) return "out_of_stock";

  // If any retailer has it in stock, consider it in stock
  const hasInStock = productLinks.some(
    (link) => link.stock_status === "in_stock"
  );
  if (hasInStock) return "in_stock";

  const hasLimited = productLinks.some(
    (link) => link.stock_status === "limited"
  );
  if (hasLimited) return "limited";

  return "out_of_stock";
}

/**
 * Convert specifications array to SpecificationSet
 */
function specsArrayToSet(
  specs?: { key: string; value: string }[]
): SpecificationSet {
  if (!specs) return {};
  return specs.reduce((acc, { key, value }) => {
    acc[key] = value;
    return acc;
  }, {} as SpecificationSet);
}

/**
 * Convert CSComponent to PCComponent
 * Note: CMS stores single description/specs, we replicate for all levels
 */
export function adaptComponent(cs: CSComponent): PCComponent {
  const specs = specsArrayToSet(cs.specifications);
  const stockStatus = deriveStockStatus(cs.product_links);

  // Build product links object
  const productLinks: PCComponent["productLinks"] = {};
  if (cs.product_links) {
    for (const link of cs.product_links) {
      const retailerKey =
        link.retailer.toLowerCase() as keyof typeof productLinks;
      productLinks[retailerKey] = {
        url: link.link?.href || "",
        price: link.price || cs.price,
      };
    }
  }

  // For now, use the same description for all levels
  // In the future, variants will provide level-specific content
  const descriptions: LevelContent<string> = {
    beginner: cs.description || "",
    intermediate: cs.description || "",
    expert: cs.description || "",
  };

  const specifications: LevelContent<SpecificationSet> = {
    beginner: specs,
    intermediate: specs,
    expert: specs,
  };

  // For PSUs, extract wattage from specifications
  let psuWattage: number | undefined;
  if (cs.category === "psu" && cs.specifications) {
    const wattageSpec = cs.specifications.find(
      (s) => s.key.toLowerCase() === "wattage"
    );
    if (wattageSpec) {
      // Parse numeric value from strings like "550W", "750 W", etc.
      psuWattage =
        parseInt(wattageSpec.value.replace(/\D/g, ""), 10) || undefined;
    }
  }

  return {
    id: cs.uid,
    title: cs.title,
    category: cs.category,
    brand: cs.brand || "",
    price: cs.price || 0,
    image: cs.image?.url || "",
    stockStatus,
    descriptions,
    specifications,
    socketType: cs.socket_type,
    powerRequirement: cs.power_requirement || 0,
    psuWattage,
    compatibilityNotes: cs.compatibility_notes,
    productLinks,
  };
}

// ============================================
// Template Adapter
// ============================================

/**
 * Convert CSTemplate to BuildTemplate
 */
export function adaptTemplate(cs: CSTemplate): BuildTemplate {
  // Extract component IDs from referenced components
  const componentIds: BuildTemplate["componentIds"] = {
    cpu: "",
    gpu: "",
    motherboard: "",
    ram: "",
    storage: "",
    psu: "",
    case: "",
    cooling: "",
  };

  // Track resolved components
  const resolvedComponents: PCComponent[] = [];

  if (cs.components && areComponentsResolved(cs.components)) {
    for (const comp of cs.components) {
      const category = comp.category as ComponentCategory;
      if (category && category in componentIds) {
        componentIds[category] = comp.uid;
      }
      // Adapt and collect resolved components
      resolvedComponents.push(adaptComponent(comp));
    }
  }

  // Calculate total price from components
  let totalPrice = cs.price || 0;
  if (resolvedComponents.length > 0) {
    totalPrice = resolvedComponents.reduce(
      (sum, comp) => sum + (comp.price || 0),
      0
    );
  }

  return {
    id: cs.uid,
    name: cs.title,
    description: cs.description || "",
    targetLevel: cs.target_level || deriveExperienceLevelId(cs.title),
    totalPrice,
    useCase: cs.use_case || "",
    componentIds,
    image: cs.image?.url || "",
    components: resolvedComponents.length > 0 ? resolvedComponents : undefined,
  };
}

// ============================================
// Page Data Extractors
// ============================================

/**
 * Extract Hero block data from page sections
 */
export function extractHeroBlock(page: CSPage): CSHeroBlock["hero"] | null {
  for (const section of page.sections || []) {
    if (isHeroBlock(section)) {
      return section.hero;
    }
  }
  return null;
}

/**
 * Extract Template block data from page sections
 */
export function extractTemplateBlock(
  page: CSPage
): CSTemplateBlock["template"] | null {
  for (const section of page.sections || []) {
    if (isTemplateBlock(section)) {
      return section.template;
    }
  }
  return null;
}

/**
 * Extract Builder block data from page sections
 */
export function extractBuilderBlock(
  page: CSPage
): CSBuilderBlock["builder"] | null {
  for (const section of page.sections || []) {
    if (isBuilderBlock(section)) {
      return section.builder;
    }
  }
  return null;
}

/**
 * Get experience levels from Hero block
 */
export function getExperienceLevelsFromPage(page: CSPage): ExperienceLevel[] {
  const hero = extractHeroBlock(page);
  if (!hero || !hero.experience_levels) return [];

  if (areExperienceLevelsResolved(hero.experience_levels)) {
    return hero.experience_levels.map(adaptExperienceLevel);
  }

  return [];
}

/**
 * Get templates from Template block
 */
export function getTemplatesFromPage(page: CSPage): BuildTemplate[] {
  const templateBlock = extractTemplateBlock(page);
  if (!templateBlock || !templateBlock.reference) return [];

  if (areTemplatesResolved(templateBlock.reference)) {
    return templateBlock.reference.map(adaptTemplate);
  }

  return [];
}

/**
 * Result type for components grouped by category
 */
export interface ComponentsByCategory {
  category: CategoryInfo;
  components: PCComponent[];
}

/**
 * Get all components from Builder block grouped by category
 */
export function getComponentsByCategoryFromPage(page: CSPage): ComponentsByCategory[] {
  const builder = extractBuilderBlock(page);
  if (!builder || !builder.component_group) return [];

  const result: ComponentsByCategory[] = [];

  for (const group of builder.component_group) {
    // Get category info (first item in the category array)
    let categoryInfo: CategoryInfo | null = null;
    if (group.category && areCategoriesResolved(group.category)) {
      const csCategory = group.category[0];
      if (csCategory) {
        categoryInfo = adaptCategory(csCategory);
      }
    }

    // Skip if no category info
    if (!categoryInfo) continue;

    // Get components for this category
    const components: PCComponent[] = [];
    if (group.components && areComponentsResolved(group.components)) {
      for (const comp of group.components) {
        components.push(adaptComponent(comp));
      }
    }

    result.push({
      category: categoryInfo,
      components,
    });
  }

  return result;
}

/**
 * Get all categories from Builder block
 */
export function getCategoriesFromBuilderPage(page: CSPage): CategoryInfo[] {
  const builder = extractBuilderBlock(page);
  if (!builder || !builder.component_group) return [];

  const categories: CategoryInfo[] = [];

  for (const group of builder.component_group) {
    if (group.category && areCategoriesResolved(group.category)) {
      const csCategory = group.category[0];
      if (csCategory) {
        categories.push(adaptCategory(csCategory));
      }
    }
  }

  return categories;
}

/**
 * Get all components from Builder block as flat array
 */
export function getAllComponentsFromPage(page: CSPage): PCComponent[] {
  const builder = extractBuilderBlock(page);
  if (!builder || !builder.component_group) return [];

  const components: PCComponent[] = [];

  for (const group of builder.component_group) {
    if (group.components && areComponentsResolved(group.components)) {
      for (const comp of group.components) {
        components.push(adaptComponent(comp));
      }
    }
  }

  return components;
}

/**
 * Get components from Builder block by specific category ID
 */
export function getComponentsFromPageByCategory(
  page: CSPage,
  categoryId: ComponentCategory
): PCComponent[] {
  const builder = extractBuilderBlock(page);
  if (!builder || !builder.component_group) return [];

  for (const group of builder.component_group) {
    // Check if this group matches the requested category
    if (group.category && areCategoriesResolved(group.category)) {
      const csCategory = group.category[0];
      if (csCategory && csCategory.category_id === categoryId) {
        if (group.components && areComponentsResolved(group.components)) {
          return group.components.map(adaptComponent);
        }
      }
    }
  }

  return [];
}

// ============================================
// Header/Footer Adapters
// ============================================

export interface AdaptedHeader {
  logo?: string;
  siteName: string;
  description?: string;
  navLinks: { name: string; url: string }[];
}

export interface AdaptedFooter {
  logo?: string;
  siteName: string;
  description?: string;
  navLinks: { name: string; url: string }[];
  copyright?: string;
}

export function adaptHeader(cs: CSHeader): AdaptedHeader {
  return {
    logo: cs.logo?.url,
    siteName: cs.name || cs.title,
    description: cs.description,
    navLinks: (cs.link || []).map((link) => ({
      name: link.title,
      url: link.href,
    })),
  };
}

export function adaptFooter(cs: CSFooter): AdaptedFooter {
  return {
    logo: cs.logo?.url,
    siteName: cs.name || cs.title,
    description: cs.description,
    navLinks: (cs.nav_links || []).map((link) => ({
      name: link.title,
      url: link.href,
    })),
    copyright: cs.copyright,
  };
}

// ============================================
// Category Adapter
// ============================================

export function adaptCategory(cs: CSCategory): CategoryInfo {
  return {
    id: cs.category_id,
    name: cs.display_name || cs.title,
    icon: cs.icon || "",
    description: cs.description || "",
  };
}

// ============================================
// Help Content Adapter
// ============================================

export interface AdaptedHelpContent {
  id: string;
  title: string;
  category?: ComponentCategory;
  explanation: string;
}

export function adaptHelpContent(cs: CSHelpContent): AdaptedHelpContent {
  return {
    id: cs.help_id || cs.uid,
    title: cs.title,
    category: cs.category,
    explanation: cs.explanation || "",
  };
}
