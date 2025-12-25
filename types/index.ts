// Component Categories
export type ComponentCategory =
  | "cpu"
  | "gpu"
  | "motherboard"
  | "ram"
  | "storage"
  | "psu"
  | "case"
  | "cooling";

// Stock Status
export type StockStatus = "in_stock" | "limited" | "out_of_stock";

// Experience Level
export type ExperienceLevelId = "beginner" | "intermediate" | "expert";

// Product Links
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

// Experience-level content
export interface LevelContent<T> {
  beginner: T;
  intermediate: T;
  expert: T;
}

// Specifications by level
export interface SpecificationSet {
  [key: string]: string | number;
}

// PC Component
export interface PCComponent {
  id: string;
  title: string;
  category: ComponentCategory;
  brand: string;
  price: number;
  image: string;
  stockStatus: StockStatus;
  descriptions: LevelContent<string>;
  specifications: LevelContent<SpecificationSet>;
  socketType?: string; // For CPU/Motherboard
  formFactor?: string; // For Motherboard/Case
  supportedFormFactors?: string[]; // For Case
  powerRequirement: number; // Wattage
  psuWattage?: number; // For PSU only
  compatibilityNotes?: string;
  productLinks: ProductLinks;
  model3dConfig?: {
    color?: string;
    emissiveColor?: string;
    scale?: number;
  };
}

// Experience Level
export interface ExperienceLevel {
  id: ExperienceLevelId;
  displayName: string;
  description: string;
  icon: string;
  tagline: string;
  features: string[];
}

// Build Template
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
  /** Resolved component objects (when available) */
  components?: PCComponent[];
}

// Help Content
export interface HelpContent {
  id: string;
  title: string;
  explanations: LevelContent<string>;
  relatedCategory?: ComponentCategory;
}

// Selected Components State
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

// Compatibility Issue
export interface CompatibilityIssue {
  type: "error" | "warning";
  title: string;
  description: string;
  affectedComponents: ComponentCategory[];
}

// Compatibility Result
export interface CompatibilityResult {
  isCompatible: boolean;
  errors: CompatibilityIssue[];
  warnings: CompatibilityIssue[];
}

// Build Store State
export interface BuildState {
  experienceLevel: ExperienceLevelId | null;
  selectedComponents: SelectedComponents;
  activeCategory: ComponentCategory;
}

// Category Display Info
export interface CategoryInfo {
  id: ComponentCategory;
  name: string;
  icon: string;
  description: string;
}

