// Contentstack Entry Types
// These types match the content models defined in Contentstack

import { ComponentCategory, ExperienceLevelId } from "@/types";

// ============================================
// Base Types
// ============================================

// Base entry type with common Contentstack fields
export interface ContentstackEntry {
  uid: string;
  title: string;
  created_at: string;
  updated_at: string;
  locale: string;
  _version: number;
}

// File/Asset type
export interface CSFile {
  uid: string;
  url: string;
  filename: string;
  title?: string;
  content_type?: string;
  file_size?: string;
}

// Link type
export interface CSLink {
  title: string;
  href: string;
}

// ============================================
// Component Content Type
// ============================================

export interface CSSpecification {
  key: string;
  value: string;
}

export interface CSProductLink {
  retailer: string;
  stock_status: "in_stock" | "limited" | "out_of_stock";
  link: CSLink;
  price: number;
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
}

// ============================================
// Experience Level Content Type
// ============================================

export interface CSExperienceLevel extends ContentstackEntry {
  description: string;
  tagline: string;
  icon: string;
  pointers?: string[];
}

// ============================================
// Template Content Type
// ============================================

export interface CSTemplate extends ContentstackEntry {
  description: string;
  price: number;
  use_case?: string;
  target_level?: ExperienceLevelId;
  components?: CSComponent[] | { uid: string; _content_type_uid: string }[];
  image?: CSFile;
}

// ============================================
// Page Content Type - Modular Blocks
// ============================================

// Hero Block
export interface CSHeroBlock {
  hero: {
    title: string;
    description: string;
    experience_levels:
      | CSExperienceLevel[]
      | { uid: string; _content_type_uid: string }[];
    features?: CSFeature[];
  };
}

// Feature item in Hero block
export interface CSFeature {
  icon: string;
  title: string;
  description: string;
}

// Template Block
export interface CSTemplateBlock {
  template: {
    title: string;
    description: string;
    reference: CSTemplate[] | { uid: string; _content_type_uid: string }[];
  };
}

// Component Group in Builder Block
export interface CSComponentGroup {
  category: CSCategory[] | { uid: string; _content_type_uid: string }[];
  components: CSComponent[] | { uid: string; _content_type_uid: string }[];
}

// Builder Block
export interface CSBuilderBlock {
  builder: {
    component_group: CSComponentGroup[];
  };
}

// Union type for all section blocks
export type CSPageSection = CSHeroBlock | CSTemplateBlock | CSBuilderBlock;

// Page Content Type
export interface CSPage extends ContentstackEntry {
  url: string;
  sections: CSPageSection[];
}

// ============================================
// Header Content Type (Singleton)
// ============================================

export interface CSHeader extends ContentstackEntry {
  logo?: CSFile;
  name: string;
  description?: string;
  link?: CSLink[];
}

// ============================================
// Footer Content Type (Singleton)
// ============================================

export interface CSFooter extends ContentstackEntry {
  logo?: CSFile;
  name: string;
  description?: string;
  nav_links?: CSLink[];
  copyright?: string;
}

// ============================================
// Category Content Type
// ============================================

export interface CSCategory extends ContentstackEntry {
  category_id: ComponentCategory;
  display_name: string;
  icon: string;
  description: string;
  sort_order: string;
}

// ============================================
// Help Content Type
// ============================================

export interface CSHelpContent extends ContentstackEntry {
  help_id: string;
  category: ComponentCategory;
  explanation: string;
}

// ============================================
// Helper Types
// ============================================

// Type guard helpers
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

// Check if experience levels are resolved (not just references)
export function areExperienceLevelsResolved(
  levels: CSExperienceLevel[] | { uid: string; _content_type_uid: string }[]
): levels is CSExperienceLevel[] {
  return levels.length > 0 && "description" in levels[0];
}

// Check if components are resolved
export function areComponentsResolved(
  components: CSComponent[] | { uid: string; _content_type_uid: string }[]
): components is CSComponent[] {
  return components.length > 0 && "category" in components[0];
}

// Check if templates are resolved
export function areTemplatesResolved(
  templates: CSTemplate[] | { uid: string; _content_type_uid: string }[]
): templates is CSTemplate[] {
  return templates.length > 0 && "description" in templates[0];
}

// Check if categories are resolved
export function areCategoriesResolved(
  categories: CSCategory[] | { uid: string; _content_type_uid: string }[]
): categories is CSCategory[] {
  return categories.length > 0 && "category_id" in categories[0];
}
