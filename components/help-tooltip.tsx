"use client";

import { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useBuildStore } from "@/store/build-store";
import { ComponentCategory } from "@/types";
import { cn } from "@/lib/utils";
import {
  getAllHelpContent,
  getHelpContentByCategory as getCmsHelpByCategory,
} from "@/lib/contentstack";
import {
  adaptHelpContent,
  AdaptedHelpContent,
} from "@/lib/contentstack/adapter";

interface HelpTooltipProps {
  helpId?: string;
  category?: ComponentCategory;
  children?: React.ReactNode;
  className?: string;
}

export function HelpTooltip({
  helpId,
  category,
  children,
  className,
}: HelpTooltipProps) {
  const { experienceLevel } = useBuildStore();
  const level = experienceLevel || "beginner";
  const [helpContent, setHelpContent] = useState<AdaptedHelpContent | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHelpContent() {
      try {
        if (helpId) {
          const allHelp = await getAllHelpContent();
          const adapted = allHelp.map(adaptHelpContent);
          const found = adapted.find((h) => h.id === helpId);
          setHelpContent(found || null);
        } else if (category) {
          const categoryHelp = await getCmsHelpByCategory(category);
          if (categoryHelp.length > 0) {
            setHelpContent(adaptHelpContent(categoryHelp[0]));
          }
        }
      } catch (error) {
        console.error("Error fetching help content:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHelpContent();
  }, [helpId, category]);

  if (isLoading || !helpContent) {
    return children || null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children || (
          <button
            className={cn(
              "inline-flex items-center justify-center w-4 h-4 rounded-full",
              "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground",
              "transition-colors text-[10px] font-bold",
              className
            )}
          >
            ?
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        className="w-80 bg-surface border-border/50 p-4"
        side="top"
        align="center"
      >
        <div className="space-y-2">
          <h4 className="font-heading font-semibold text-sm text-neon-green">
            {helpContent.title}
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {helpContent.explanation}
          </p>
          {level !== "advanced" && (
            <p className="text-[10px] text-muted-foreground/70 pt-2 border-t border-border/30">
              💡 Tip: Select &quot;Expert&quot; mode for more technical details.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function CPUSocketHelp() {
  return <HelpTooltip helpId="help-001" />;
}

export function RAMSpeedHelp() {
  return <HelpTooltip helpId="help-002" />;
}

export function PSUWattageHelp() {
  return <HelpTooltip helpId="help-003" />;
}

export function FormFactorHelp() {
  return <HelpTooltip helpId="help-004" />;
}

export function StorageHelp() {
  return <HelpTooltip helpId="help-005" />;
}

export function CoolingHelp() {
  return <HelpTooltip helpId="help-006" />;
}

export function HelpPanel() {
  const [helpContent, setHelpContent] = useState<AdaptedHelpContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAllHelpContent() {
      try {
        const allHelp = await getAllHelpContent();
        const adapted = allHelp.map(adaptHelpContent);
        setHelpContent(adapted);
      } catch (error) {
        console.error("Error fetching help content:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAllHelpContent();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="font-heading font-bold text-lg">Help & Guides</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (helpContent.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="font-heading font-bold text-lg">Help & Guides</h3>
        <p className="text-muted-foreground text-sm">
          No help content available. Please add help content in Contentstack.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-heading font-bold text-lg">Help & Guides</h3>
      <div className="grid gap-3">
        {helpContent.map((help) => (
          <div
            key={help.id}
            className="p-4 rounded-lg bg-surface/50 border border-border/30 hover:border-neon-green/30 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-neon-green/20 flex items-center justify-center shrink-0">
                <span className="text-neon-green text-sm">💡</span>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">{help.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {help.explanation}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
