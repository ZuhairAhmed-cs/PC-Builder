"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useBuildStore } from "@/store/build-store";
import { ExperienceLevelId, ExperienceLevel } from "@/types";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ExperienceSelectorProps {
  experienceLevels: ExperienceLevel[];
}

export function ExperienceSelector({
  experienceLevels,
}: ExperienceSelectorProps) {
  const router = useRouter();
  const { experienceLevel, setExperienceLevel } = useBuildStore();
  const [isSettingLevel, setIsSettingLevel] = useState(false);

  const handleSelect = async (levelId: ExperienceLevelId) => {
    if (isSettingLevel) return;

    setIsSettingLevel(true);

    try {
      const response = await fetch("/api/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: levelId }),
      });

      if (!response.ok) {
        throw new Error("Failed to set experience level");
      }

      setExperienceLevel(levelId);
      router.push("/builder");
    } catch (error) {
      console.error("Error setting experience level:", error);
      setExperienceLevel(levelId);
      router.push("/builder");
    }
  };

  if (!experienceLevels || experienceLevels.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No experience levels available.</p>
      </div>
    );
  }

  return (
    <>
      {isSettingLevel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-neon-green" />
            <p className="text-lg font-medium text-foreground">
              Loading builder...
            </p>
          </div>
        </motion.div>
      )}

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
            <div
              className={cn(
                "absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300",
                "bg-gradient-to-br from-neon-green/10 via-transparent to-neon-cyan/10",
                "group-hover:opacity-100"
              )}
            />

            <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
              <div
                className="absolute inset-[-2px] bg-gradient-to-r from-neon-green via-neon-cyan to-neon-magenta animate-spin-slow"
                style={{ animationDuration: "3s" }}
              />
              <div className="absolute inset-[1px] rounded-2xl bg-surface" />
            </div>

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-xl bg-background/50 border border-border/50 flex items-center justify-center mb-4 group-hover:border-neon-green/30 transition-colors">
                <span className="text-4xl" {...level.$?.icon}>
                  {level.icon}
                </span>
              </div>

              <h3
                className="font-heading font-bold text-xl mb-1 text-foreground group-hover:text-neon-green transition-colors"
                {...level.$?.title}
              >
                {level.displayName}
              </h3>

              <p
                className="text-sm text-neon-green/80 mb-3 font-medium"
                {...level.$?.tagline}
              >
                {level.tagline}
              </p>

              <p
                className="text-sm text-muted-foreground leading-relaxed"
                {...level.$?.description}
              >
                {level.description}
              </p>

              {level.features && level.features.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/30">
                  <ul className="space-y-2">
                    {level.features.map((feature, idx) => (
                      <FeatureItem key={idx}>{feature}</FeatureItem>
                    ))}
                  </ul>
                </div>
              )}

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
    </>
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
