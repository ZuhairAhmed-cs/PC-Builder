import Cookies from "js-cookie";
import { v4 as uuidv4 } from "uuid";

/**
 * Cookie names for personalization
 */
export const COOKIES = {
  EXPERIENCE_LEVEL: "cs_experience_level",
  USER_ID: "cs_user_id",
} as const;

/**
 * LocalStorage keys for personalization
 */
export const STORAGE_KEYS = {
  EXPERIENCE_LEVEL: "cs_experience_level",
} as const;

/**
 * Experience level type
 */
export type ExperienceLevelId = "beginner" | "intermediate" | "advanced";

/**
 * Get or create a unique user ID
 * Creates a persistent UUID if one doesn't exist
 */
export function getUserId(): string {
  const existingUserId = Cookies.get(COOKIES.USER_ID);

  if (existingUserId) {
    return existingUserId;
  }

  const newUserId = uuidv4();
  // Set cookie for 1 year
  Cookies.set(COOKIES.USER_ID, newUserId, { expires: 365 });

  return newUserId;
}

/**
 * Get the current experience level from localStorage
 */
export function getExperienceLevel(): ExperienceLevelId | null {
  if (typeof window === "undefined") return null;

  const level = localStorage.getItem(STORAGE_KEYS.EXPERIENCE_LEVEL);
  return level as ExperienceLevelId | null;
}

/**
 * Set the experience level in localStorage and cookie
 * Cookie is used by Launch Edge Function
 */
export function setExperienceLevel(level: ExperienceLevelId): void {
  if (typeof window === "undefined") return;

  // Store in localStorage for client-side persistence
  localStorage.setItem(STORAGE_KEYS.EXPERIENCE_LEVEL, level);

  // Store in cookie for edge function access
  // Set for 30 days
  Cookies.set(COOKIES.EXPERIENCE_LEVEL, level, { expires: 30 });
}

/**
 * Clear experience level selection
 * Removes from both localStorage and cookies
 */
export function clearExperienceLevel(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(STORAGE_KEYS.EXPERIENCE_LEVEL);
  Cookies.remove(COOKIES.EXPERIENCE_LEVEL);
}

/**
 * Check if user has selected an experience level
 */
export function hasExperienceLevel(): boolean {
  return getExperienceLevel() !== null;
}

/**
 * Get experience level cookie value (for server-side)
 * This is used in edge functions
 */
export function getExperienceLevelCookie(): string | undefined {
  return Cookies.get(COOKIES.EXPERIENCE_LEVEL);
}
