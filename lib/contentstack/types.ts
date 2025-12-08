import { ComponentCategory, ExperienceLevelId } from "@/types";

export interface CSLPAttribute {
  "data-cslp": string;
}

export type WithCSLP<T extends string> = {
  $?: { [K in T]?: CSLPAttribute };
};

export interface ContentstackEntry {
  uid: string;
  title: string;
  created_at: string;
  updated_at: string;
  locale: string;
  _version: number;
  $?: {
    title?: CSLPAttribute;
    [key: string]: CSLPAttribute | undefined;
  };
}

export interface CSFile {
  uid: string;
  url: string;
  filename: string;
  title?: string;
  content_type?: string;
  file_size?: string;
  $?: {
    url?: CSLPAttribute;
  };
}

export interface CSLink {
  title: string;
  href: string;
  $?: {
    title?: CSLPAttribute;
    href?: CSLPAttribute;
  };
}

export interface CSSpecification {
  key: string;
  value: string;
  $?: {
    key?: CSLPAttribute;
    value?: CSLPAttribute;
  };
}

export interface CSProductLink {
  retailer: string;
  stock_status: "in_stock" | "limited" | "out_of_stock";
  link: CSLink;
  price: number;
  $?: {
    retailer?: CSLPAttribute;
    stock_status?: CSLPAttribute;
    price?: CSLPAttribute;
  };
}

export interface CSComponent extends ContentstackEntry {
  category: ComponentCategory;
  brand: string;
  price: number;
  image?: CSFile;
  description: string;
  specifications: CSSpecification[];
  socket_type?: string;
  power_requirement: number;
  compatibility_notes?: string;
  product_links?: CSProductLink[];
  $?: {
    title?: CSLPAttribute;
    category?: CSLPAttribute;
    brand?: CSLPAttribute;
    price?: CSLPAttribute;
    description?: CSLPAttribute;
    socket_type?: CSLPAttribute;
    power_requirement?: CSLPAttribute;
    compatibility_notes?: CSLPAttribute;
    [key: string]: CSLPAttribute | undefined;
  };
}

export interface CSExperienceLevel extends ContentstackEntry {
  description: string;
  tagline: string;
  icon: string;
  pointers?: string[];
  $?: {
    title?: CSLPAttribute;
    description?: CSLPAttribute;
    tagline?: CSLPAttribute;
    icon?: CSLPAttribute;
    [key: string]: CSLPAttribute | undefined;
  };
}

export interface CSTemplate extends ContentstackEntry {
  description: string;
  price: number;
  use_case?: string;
  target_level?: ExperienceLevelId;
  components?: CSComponent[] | { uid: string; _content_type_uid: string }[];
  image?: CSFile;
  logo?: string;
  $?: {
    title?: CSLPAttribute;
    description?: CSLPAttribute;
    price?: CSLPAttribute;
    use_case?: CSLPAttribute;
    target_level?: CSLPAttribute;
    logo?: CSLPAttribute;
    [key: string]: CSLPAttribute | undefined;
  };
}

export interface CSFeature {
  icon: string;
  title: string;
  description: string;
  $?: {
    icon?: CSLPAttribute;
    title?: CSLPAttribute;
    description?: CSLPAttribute;
  };
}

export interface CSHeroBlock {
  hero: {
    title: string;
    description: string;
    experience_levels:
      | CSExperienceLevel[]
      | { uid: string; _content_type_uid: string }[];
    features?: CSFeature[];
    $?: {
      title?: CSLPAttribute;
      description?: CSLPAttribute;
    };
  };
}

export interface CSTemplateBlock {
  template: {
    title: string;
    description: string;
    reference: CSTemplate[] | { uid: string; _content_type_uid: string }[];
    $?: {
      title?: CSLPAttribute;
      description?: CSLPAttribute;
    };
  };
}

export interface CSComponentGroup {
  category: CSCategory[] | { uid: string; _content_type_uid: string }[];
  components: CSComponent[] | { uid: string; _content_type_uid: string }[];
}

export interface CSBuilderBlock {
  builder: {
    component_group: CSComponentGroup[];
  };
}

export type CSPageSection = CSHeroBlock | CSTemplateBlock | CSBuilderBlock;

export interface CSPage extends ContentstackEntry {
  url: string;
  sections: CSPageSection[];
  $?: {
    title?: CSLPAttribute;
    url?: CSLPAttribute;
    [key: string]: CSLPAttribute | undefined;
  };
}

export interface CSHeader extends ContentstackEntry {
  logo?: CSFile;
  name: string;
  description?: string;
  link?: CSLink[];
  $?: {
    title?: CSLPAttribute;
    name?: CSLPAttribute;
    description?: CSLPAttribute;
    [key: string]: CSLPAttribute | undefined;
  };
}

export interface CSFooter extends ContentstackEntry {
  logo?: CSFile;
  name: string;
  description?: string;
  nav_links?: CSLink[];
  copyright?: string;
  $?: {
    title?: CSLPAttribute;
    name?: CSLPAttribute;
    description?: CSLPAttribute;
    copyright?: CSLPAttribute;
    [key: string]: CSLPAttribute | undefined;
  };
}

export interface CSCategory extends ContentstackEntry {
  category_id: ComponentCategory;
  display_name: string;
  icon: string;
  description: string;
  sort_order: string;
  $?: {
    title?: CSLPAttribute;
    display_name?: CSLPAttribute;
    icon?: CSLPAttribute;
    description?: CSLPAttribute;
    [key: string]: CSLPAttribute | undefined;
  };
}

export interface CSHelpContent extends ContentstackEntry {
  help_id: string;
  category: ComponentCategory;
  explanation: string;
  $?: {
    title?: CSLPAttribute;
    help_id?: CSLPAttribute;
    explanation?: CSLPAttribute;
    [key: string]: CSLPAttribute | undefined;
  };
}

export function isHeroBlock(section: CSPageSection): section is CSHeroBlock {
  return "hero" in section;
}

export function isTemplateBlock(
  section: CSPageSection
): section is CSTemplateBlock {
  return "template" in section;
}

export function isBuilderBlock(
  section: CSPageSection
): section is CSBuilderBlock {
  return "builder" in section;
}

export function areExperienceLevelsResolved(
  levels: CSExperienceLevel[] | { uid: string; _content_type_uid: string }[]
): levels is CSExperienceLevel[] {
  return levels.length > 0 && "description" in levels[0];
}

export function areComponentsResolved(
  components: CSComponent[] | { uid: string; _content_type_uid: string }[]
): components is CSComponent[] {
  return components.length > 0 && "category" in components[0];
}

export function areTemplatesResolved(
  templates: CSTemplate[] | { uid: string; _content_type_uid: string }[]
): templates is CSTemplate[] {
  return templates.length > 0 && "description" in templates[0];
}

export function areCategoriesResolved(
  categories: CSCategory[] | { uid: string; _content_type_uid: string }[]
): categories is CSCategory[] {
  return categories.length > 0 && "category_id" in categories[0];
}
