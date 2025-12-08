import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ExperienceLevelId, PCComponent, LevelContent } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return `₹${price.toLocaleString('en-IN', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  })}`;
}

export function formatWattage(watts: number): string {
  return `${watts}W`;
}

export function getLevelContent<T>(
  content: LevelContent<T>,
  level: ExperienceLevelId
): T {
  return content[level];
}

export function getDescription(
  component: PCComponent,
  level: ExperienceLevelId
): string {
  return component.descriptions[level];
}

export function getSpecifications(
  component: PCComponent,
  level: ExperienceLevelId
): Record<string, string | number> {
  return component.specifications[level];
}

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

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}
