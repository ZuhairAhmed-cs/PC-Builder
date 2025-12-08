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
  CSLPAttribute,
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

function deriveExperienceLevelId(
  title: string
): "beginner" | "intermediate" | "advanced" {
  const name = title.toLowerCase();
  if (
    name.includes("beginner") ||
    name.includes("first") ||
    name.includes("starter") ||
    name.includes("basic") ||
    name.includes("entry")
  ) {
    return "beginner";
  }
  if (
    name.includes("expert") ||
    name.includes("advanced") ||
    name.includes("pro") ||
    name.includes("ultimate") ||
    name.includes("extreme")
  ) {
    return "advanced";
  }
  return "intermediate";
}

export function adaptExperienceLevel(cs: CSExperienceLevel): ExperienceLevel {
  const id = deriveExperienceLevelId(cs.title);

  return {
    id,
    displayName: cs.title,
    description: cs.description || "",
    icon: cs.icon || "🔧",
    tagline: cs.tagline || "",
    features: cs.pointers || [],
    $: cs.$,
  };
}

function deriveStockStatus(
  productLinks?: { stock_status: string }[]
): StockStatus {
  if (!productLinks || productLinks.length === 0) return "out_of_stock";

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

function specsArrayToSet(
  specs?: { key: string; value: string }[]
): SpecificationSet {
  if (!specs) return {};
  return specs.reduce((acc, { key, value }) => {
    acc[key] = value;
    return acc;
  }, {} as SpecificationSet);
}

export function adaptComponent(cs: CSComponent): PCComponent {
  const specs = specsArrayToSet(cs.specifications);
  const stockStatus = deriveStockStatus(cs.product_links);

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

  const descriptions: LevelContent<string> = {
    beginner: cs.description || "",
    intermediate: cs.description || "",
    advanced: cs.description || "",
  };

  const specifications: LevelContent<SpecificationSet> = {
    beginner: specs,
    intermediate: specs,
    advanced: specs,
  };

  let psuWattage: number | undefined;
  if (cs.category === "psu" && cs.specifications) {
    const wattageSpec = cs.specifications.find(
      (s) => s.key.toLowerCase() === "wattage"
    );
    if (wattageSpec) {
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
    image$: cs.image?.$,
    stockStatus,
    descriptions,
    specifications,
    socketType: cs.socket_type,
    powerRequirement: cs.power_requirement || 0,
    psuWattage,
    compatibilityNotes: cs.compatibility_notes,
    productLinks,
    $: cs.$,
  };
}

export function adaptTemplate(cs: CSTemplate): BuildTemplate {
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

  const resolvedComponents: PCComponent[] = [];

  if (cs.components && areComponentsResolved(cs.components)) {
    for (const comp of cs.components) {
      const category = comp.category as ComponentCategory;
      if (category && category in componentIds) {
        componentIds[category] = comp.uid;
      }
      resolvedComponents.push(adaptComponent(comp));
    }
  }

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
    image$: cs.image?.$,
    icon: cs.logo,
    components: resolvedComponents.length > 0 ? resolvedComponents : undefined,
    $: cs.$,
  };
}

export function extractHeroBlock(page: CSPage): CSHeroBlock["hero"] | null {
  for (const section of page.sections || []) {
    if (isHeroBlock(section)) {
      return section.hero;
    }
  }
  return null;
}

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

export function getExperienceLevelsFromPage(page: CSPage): ExperienceLevel[] {
  const hero = extractHeroBlock(page);
  if (!hero || !hero.experience_levels) return [];

  if (areExperienceLevelsResolved(hero.experience_levels)) {
    return hero.experience_levels.map(adaptExperienceLevel);
  }

  return [];
}

export function getTemplatesFromPage(page: CSPage): BuildTemplate[] {
  const templateBlock = extractTemplateBlock(page);
  if (!templateBlock || !templateBlock.reference) return [];

  if (areTemplatesResolved(templateBlock.reference)) {
    return templateBlock.reference.map(adaptTemplate);
  }

  return [];
}

export interface ComponentsByCategory {
  category: CategoryInfo;
  components: PCComponent[];
}

export function getComponentsByCategoryFromPage(
  page: CSPage
): ComponentsByCategory[] {
  const builder = extractBuilderBlock(page);
  if (!builder || !builder.component_group) return [];

  const result: ComponentsByCategory[] = [];

  for (const group of builder.component_group) {
    let categoryInfo: CategoryInfo | null = null;
    if (group.category && areCategoriesResolved(group.category)) {
      const csCategory = group.category[0];
      if (csCategory) {
        categoryInfo = adaptCategory(csCategory);
      }
    }

    if (!categoryInfo) continue;

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

export function getComponentsFromPageByCategory(
  page: CSPage,
  categoryId: ComponentCategory
): PCComponent[] {
  const builder = extractBuilderBlock(page);
  if (!builder || !builder.component_group) return [];

  for (const group of builder.component_group) {
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

export interface AdaptedHeader {
  logo?: string;
  siteName: string;
  description?: string;
  navLinks: {
    name: string;
    url: string;
    $?: { title?: CSLPAttribute; href?: CSLPAttribute };
  }[];
  $?: {
    name?: CSLPAttribute;
    description?: CSLPAttribute;
    [key: string]: CSLPAttribute | undefined;
  };
  logo$?: {
    url?: CSLPAttribute;
  };
}

export interface AdaptedFooter {
  logo?: string;
  siteName: string;
  description?: string;
  navLinks: {
    name: string;
    url: string;
    $?: { title?: CSLPAttribute; href?: CSLPAttribute };
  }[];
  copyright?: string;
  $?: {
    name?: CSLPAttribute;
    description?: CSLPAttribute;
    copyright?: CSLPAttribute;
    [key: string]: CSLPAttribute | undefined;
  };
  logo$?: {
    url?: CSLPAttribute;
  };
}

export function adaptHeader(cs: CSHeader): AdaptedHeader {
  return {
    logo: cs.logo?.url,
    siteName: cs.name || cs.title,
    description: cs.description,
    navLinks: (cs.link || []).map((link) => ({
      name: link.title,
      url: link.href,
      $: link.$,
    })),
    $: cs.$,
    logo$: cs.logo?.$,
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
      $: link.$,
    })),
    copyright: cs.copyright,
    $: cs.$,
    logo$: cs.logo?.$,
  };
}

export function adaptCategory(cs: CSCategory): CategoryInfo {
  return {
    id: cs.category_id,
    name: cs.display_name || cs.title,
    icon: cs.icon || "",
    description: cs.description || "",
    $: cs.$,
  };
}

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
