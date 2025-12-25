"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  getExperienceLevel,
  setExperienceLevel as setExperienceLevelCookie,
  clearExperienceLevel as clearExperienceLevelCookie,
  type ExperienceLevelId,
} from "./client";

interface ExperienceLevelContextValue {
  experienceLevel: ExperienceLevelId | null;
  setExperienceLevel: (level: ExperienceLevelId) => void;
  clearExperienceLevel: () => void;
  isLoading: boolean;
}

const ExperienceLevelContext = createContext<
  ExperienceLevelContextValue | undefined
>(undefined);

interface ExperienceLevelProviderProps {
  children: React.ReactNode;
}

export function ExperienceLevelProvider({
  children,
}: ExperienceLevelProviderProps) {
  const [experienceLevel, setExperienceLevelState] =
    useState<ExperienceLevelId | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load experience level from localStorage on mount
  useEffect(() => {
    const level = getExperienceLevel();
    setExperienceLevelState(level);
    setIsLoading(false);
  }, []);

  const setExperienceLevel = useCallback((level: ExperienceLevelId) => {
    setExperienceLevelState(level);
    setExperienceLevelCookie(level);
  }, []);

  const clearExperienceLevel = useCallback(() => {
    setExperienceLevelState(null);
    clearExperienceLevelCookie();
  }, []);

  const value: ExperienceLevelContextValue = {
    experienceLevel,
    setExperienceLevel,
    clearExperienceLevel,
    isLoading,
  };

  return (
    <ExperienceLevelContext.Provider value={value}>
      {children}
    </ExperienceLevelContext.Provider>
  );
}

export function useExperienceLevel() {
  const context = useContext(ExperienceLevelContext);

  if (context === undefined) {
    throw new Error(
      "useExperienceLevel must be used within an ExperienceLevelProvider"
    );
  }

  return context;
}
