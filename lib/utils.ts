import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ExperienceLevelId, PCComponent, LevelContent } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format price with currency
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
  }).format(price);
}

// Format wattage
export function formatWattage(watts: number): string {
  return `${watts}W`;
}

// Get content based on experience level
export function getLevelContent<T>(
  content: LevelContent<T>,
  level: ExperienceLevelId
): T {
  return content[level];
}

// Get description based on experience level
export function getDescription(
  component: PCComponent,
  level: ExperienceLevelId
): string {
  return component.descriptions[level];
}

// Get specifications based on experience level
export function getSpecifications(
  component: PCComponent,
  level: ExperienceLevelId
): Record<string, string | number> {
  return component.specifications[level];
}

// Stock status display helpers
export function getStockStatusColor(status: string): string {
  switch (status) {
    case "in_stock":
      return "text-neon-green";
    case "limited":
      return "text-neon-orange";
    case "out_of_stock":
      return "text-destructive";
    default:
      return "text-muted-foreground";
  }
}

export function getStockStatusText(status: string): string {
  switch (status) {
    case "in_stock":
      return "In Stock";
    case "limited":
      return "Limited Stock";
    case "out_of_stock":
      return "Out of Stock";
    default:
      return "Unknown";
  }
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}
