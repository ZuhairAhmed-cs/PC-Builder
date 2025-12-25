import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  PCComponent,
  ComponentCategory,
  ExperienceLevelId,
  SelectedComponents,
} from "@/types";

interface BuildStore {
  // State
  experienceLevel: ExperienceLevelId | null;
  selectedComponents: SelectedComponents;
  activeCategory: ComponentCategory;

  // Actions
  setExperienceLevel: (level: ExperienceLevelId) => void;
  addComponent: (category: ComponentCategory, component: PCComponent) => void;
  removeComponent: (category: ComponentCategory) => void;
  clearBuild: () => void;
  setActiveCategory: (category: ComponentCategory) => void;
  resetStore: () => void;

  // Computed helpers (implemented as functions to avoid hydration issues)
  getTotalPrice: () => number;
  getTotalPower: () => number;
  getCompletionCount: () => number;
  getPSUWattage: () => number;
}

const initialSelectedComponents: SelectedComponents = {
  cpu: null,
  gpu: null,
  motherboard: null,
  ram: null,
  storage: null,
  psu: null,
  case: null,
  cooling: null,
};

export const useBuildStore = create<BuildStore>()(
  persist(
    (set, get) => ({
      // Initial State
      experienceLevel: null,
      selectedComponents: { ...initialSelectedComponents },
      activeCategory: "cpu",

      // Actions
      setExperienceLevel: (level) => set({ experienceLevel: level }),

      addComponent: (category, component) =>
        set((state) => ({
          selectedComponents: {
            ...state.selectedComponents,
            [category]: component,
          },
        })),

      removeComponent: (category) =>
        set((state) => ({
          selectedComponents: {
            ...state.selectedComponents,
            [category]: null,
          },
        })),

      clearBuild: () =>
        set({
          selectedComponents: { ...initialSelectedComponents },
          activeCategory: "cpu",
        }),

      setActiveCategory: (category) => set({ activeCategory: category }),

      resetStore: () =>
        set({
          experienceLevel: null,
          selectedComponents: { ...initialSelectedComponents },
          activeCategory: "cpu",
        }),

      // Computed helpers
      getTotalPrice: () => {
        const { selectedComponents } = get();
        return Object.values(selectedComponents).reduce(
          (total, component) => total + (component?.price || 0),
          0
        );
      },

      getTotalPower: () => {
        const { selectedComponents } = get();
        return Object.values(selectedComponents).reduce(
          (total, component) => total + (component?.powerRequirement || 0),
          0
        );
      },

      getCompletionCount: () => {
        const { selectedComponents } = get();
        return Object.values(selectedComponents).filter(Boolean).length;
      },

      getPSUWattage: () => {
        const { selectedComponents } = get();
        return selectedComponents.psu?.psuWattage || 0;
      },
    }),
    {
      name: "pc-builder-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        experienceLevel: state.experienceLevel,
        selectedComponents: state.selectedComponents,
        activeCategory: state.activeCategory,
      }),
    }
  )
);

