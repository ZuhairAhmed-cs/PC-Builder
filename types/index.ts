import type { CSLPAttribute } from "@/lib/contentstack/types";

export type ComponentCategory =
  | "cpu"
  | "gpu"
  | "motherboard"
  | "ram"
  | "storage"
  | "psu"
  | "case"
  | "cooling";

export type StockStatus = "in_stock" | "limited" | "out_of_stock";

export type ExperienceLevelId = "beginner" | "intermediate" | "advanced";

export interface ProductLink {
  url: string;
  price: number;
  lastUpdated?: string;
}

export interface ProductLinks {
  amazon?: ProductLink;
  newegg?: ProductLink;
  bestbuy?: ProductLink;
  bhphoto?: ProductLink;
}

export interface LevelContent<T> {
  beginner: T;
  intermediate: T;
  advanced: T;
}

export interface SpecificationSet {
  [key: string]: string | number;
}

export interface PCComponent {
  id: string;
  title: string;
  category: ComponentCategory;
  brand: string;
  price: number;
  image: string;
  image$?: { url?: CSLPAttribute };
  stockStatus: StockStatus;
  descriptions: LevelContent<string>;
  specifications: LevelContent<SpecificationSet>;
  socketType?: string;
  formFactor?: string;
  supportedFormFactors?: string[];
  powerRequirement: number;
  psuWattage?: number;
  compatibilityNotes?: string;
  productLinks: ProductLinks;
  model3dConfig?: {
    color?: string;
    emissiveColor?: string;
    scale?: number;
  };
  $?: {
    title?: CSLPAttribute;
    brand?: CSLPAttribute;
    price?: CSLPAttribute;
    description?: CSLPAttribute;
    [key: string]: CSLPAttribute | undefined;
  };
}

export interface ExperienceLevel {
  id: ExperienceLevelId;
  displayName: string;
  description: string;
  icon: string;
  tagline: string;
  features: string[];
  $?: {
    title?: CSLPAttribute;
    description?: CSLPAttribute;
    tagline?: CSLPAttribute;
    icon?: CSLPAttribute;
    [key: string]: CSLPAttribute | undefined;
  };
}

export interface BuildTemplate {
  id: string;
  name: string;
  description: string;
  targetLevel: ExperienceLevelId;
  totalPrice: number;
  useCase: string;
  componentIds: {
    cpu: string;
    gpu: string;
    motherboard: string;
    ram: string;
    storage: string;
    psu: string;
    case: string;
    cooling: string;
  };
  image: string;
  image$?: { url?: CSLPAttribute };
  icon?: string;
  components?: PCComponent[];
  $?: {
    title?: CSLPAttribute;
    description?: CSLPAttribute;
    price?: CSLPAttribute;
    use_case?: CSLPAttribute;
    [key: string]: CSLPAttribute | undefined;
  };
}

export interface HelpContent {
  id: string;
  title: string;
  explanations: LevelContent<string>;
  relatedCategory?: ComponentCategory;
}

export interface SelectedComponents {
  cpu: PCComponent | null;
  gpu: PCComponent | null;
  motherboard: PCComponent | null;
  ram: PCComponent | null;
  storage: PCComponent | null;
  psu: PCComponent | null;
  case: PCComponent | null;
  cooling: PCComponent | null;
}

export interface CompatibilityIssue {
  type: "error" | "warning";
  title: string;
  description: string;
  affectedComponents: ComponentCategory[];
}

export interface CompatibilityResult {
  isCompatible: boolean;
  errors: CompatibilityIssue[];
  warnings: CompatibilityIssue[];
}

export interface BuildState {
  experienceLevel: ExperienceLevelId | null;
  selectedComponents: SelectedComponents;
  activeCategory: ComponentCategory;
}

export interface CategoryInfo {
  id: ComponentCategory;
  name: string;
  icon: string;
  description: string;
  $?: {
    display_name?: CSLPAttribute;
    icon?: CSLPAttribute;
    description?: CSLPAttribute;
    [key: string]: CSLPAttribute | undefined;
  };
}
