"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useBuildStore } from "@/store/build-store";
import { ExperienceLevelId, ExperienceLevel } from "@/types";
import { cn } from "@/lib/utils";
import {
  useExperienceLevel,
  setExperienceLevel as setExperienceLevelPersist,
} from "@/lib/personalize";

interface ExperienceSelectorProps {
  experienceLevels: ExperienceLevel[];
}

export function ExperienceSelector({
  experienceLevels,
}: ExperienceSelectorProps) {
  const router = useRouter();
  const {
    setExperienceLevel: setExperienceLevelStore,
    experienceLevel: storeExperienceLevel,
  } = useBuildStore();
  const { experienceLevel: contextExperienceLevel } = useExperienceLevel();

  // Use context value if available, otherwise fall back to store
  const experienceLevel = contextExperienceLevel || storeExperienceLevel;

  const handleSelect = (levelId: ExperienceLevelId) => {
    // Set in Zustand store for UI state
    setExperienceLevelStore(levelId);

    // Set in personalize context (localStorage + cookie for edge function)
    setExperienceLevelPersist(levelId);

    // Navigate to builder WITH level query parameter for Personalize audience matching
    router.push(`/builder?level=${levelId}`);
  };

  if (!experienceLevels || experienceLevels.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No experience levels available.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {experienceLevels.map((level, index) => (
        <motion.button
          key={level.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          onClick={() => handleSelect(level.id)}
          className={cn(
            "group relative p-6 rounded-2xl text-left transition-all duration-300",
            "bg-surface/50 backdrop-blur-sm border border-border/50",
            "hover:border-neon-green/50 hover:bg-surface/80",
            "focus:outline-none focus:ring-2 focus:ring-neon-green/50",
            experienceLevel === level.id && "border-neon-green bg-surface/80"
          )}
        >
          {/* Glow effect */}
          <div
            className={cn(
              "absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300",
              "bg-gradient-to-br from-neon-green/10 via-transparent to-neon-cyan/10",
              "group-hover:opacity-100"
            )}
          />

          {/* RGB border animation on hover */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
            <div
              className="absolute inset-[-2px] bg-gradient-to-r from-neon-green via-neon-cyan to-neon-magenta animate-spin-slow"
              style={{ animationDuration: "3s" }}
            />
            <div className="absolute inset-[1px] rounded-2xl bg-surface" />
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Icon */}
            <div className="w-16 h-16 rounded-xl bg-background/50 border border-border/50 flex items-center justify-center mb-4 group-hover:border-neon-green/30 transition-colors">
              <span className="text-4xl">{level.icon}</span>
            </div>

            {/* Title */}
            <h3 className="font-heading font-bold text-xl mb-1 text-foreground group-hover:text-neon-green transition-colors">
              {level.displayName}
            </h3>

            {/* Tagline */}
            <p className="text-sm text-neon-green/80 mb-3 font-medium">
              {level.tagline}
            </p>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {level.description}
            </p>

            {/* Features */}
            {level.features && level.features.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border/30">
                <ul className="space-y-2">
                  {level.features.map((feature, idx) => (
                    <FeatureItem key={idx}>{feature}</FeatureItem>
                  ))}
                </ul>
              </div>
            )}

            {/* Select indicator */}
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground group-hover:text-neon-green transition-colors">
              <span>Select</span>
              <svg
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2 text-xs text-muted-foreground">
      <svg
        className="w-3 h-3 text-neon-green"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
      {children}
    </li>
  );
}
