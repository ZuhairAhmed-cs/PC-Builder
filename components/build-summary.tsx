"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { SaveBuildDialog } from "@/components/dashboard/save-build-dialog";
import { useBuildStore } from "@/store/build-store";
import { createClient } from "@/lib/supabase/client";
import { CategoryInfo } from "@/types";
import { cn, formatPrice, formatWattage } from "@/lib/utils";
import { CompatibilityChecker } from "@/components/compatibility-checker";
import { Save, Loader2 } from "lucide-react";

interface BuildSummaryProps {
  categories: CategoryInfo[];
}

export function BuildSummary({ categories }: BuildSummaryProps) {
  const router = useRouter();
  const {
    selectedComponents,
    removeComponent,
    clearBuild,
    getTotalPrice,
    getTotalPower,
    getCompletionCount,
    getPSUWattage,
    setActiveCategory,
    experienceLevel,
    resetStore,
    setIsNavigatingAway,
  } = useBuildStore();

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isNavigatingToSignup, setIsNavigatingToSignup] = useState(false);

  const totalPrice = getTotalPrice();
  const totalPower = getTotalPower();
  const completionCount = getCompletionCount();
  const psuWattage = getPSUWattage();
  const completionPercent = (completionCount / 8) * 100;

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleSaveClick = () => {
    if (!isAuthenticated) {
      setIsNavigatingToSignup(true);
      const pendingBuild = {
        experienceLevel,
        components: selectedComponents,
        totalPrice,
      };
      localStorage.setItem("pendingBuild", JSON.stringify(pendingBuild));
      router.push("/auth/signup?redirect=/builder&action=save");
    } else {
      setShowSaveDialog(true);
    }
  };

  const handleSaveBuild = async (name: string, description: string) => {
    setSaveError(null);

    try {
      const payload = {
        name,
        description,
        experienceLevel,
        components: selectedComponents,
        totalPrice,
      };

      const response = await fetch("/api/builds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save build");
      }

      setShowSaveDialog(false);
      setIsNavigatingAway(true);
      resetStore();
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Failed to save build"
      );
    }
  };

  const powerHeadroom =
    psuWattage > 0 ? ((psuWattage - totalPower) / psuWattage) * 100 : 0;
  const powerStatus =
    psuWattage === 0
      ? "neutral"
      : totalPower > psuWattage
      ? "danger"
      : powerHeadroom < 20
      ? "warning"
      : "good";

  return (
    <div className="space-y-4">
      <Card className="bg-surface/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg flex items-center justify-between">
            <span>Your Build</span>
            <span className="text-sm font-normal text-muted-foreground">
              {completionCount}/8 components
            </span>
          </CardTitle>
          <Progress value={completionPercent} className="h-2 bg-background" />
        </CardHeader>

        <CardContent className="space-y-3">
          {categories.map((category) => {
            const component = selectedComponents[category.id];

            return (
              <div
                key={category.id}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer",
                  "hover:bg-background/50",
                  component ? "bg-background/30" : "opacity-60"
                )}
                onClick={() => setActiveCategory(category.id)}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-sm",
                    component ? "bg-neon-green/20" : "bg-muted/30"
                  )}
                >
                  {category.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">
                    {category.name}
                  </p>
                  {component ? (
                    <p className="text-sm font-medium truncate">
                      {component.title}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Not selected
                    </p>
                  )}
                </div>

                {component && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-neon-green">
                      {formatPrice(component.price)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeComponent(category.id);
                      }}
                      className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          <Separator className="bg-border/30" />

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Power Draw</span>
              {psuWattage > 0 && (
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    powerStatus === "good" &&
                      "bg-neon-green/20 text-neon-green",
                    powerStatus === "warning" &&
                      "bg-neon-orange/20 text-neon-orange",
                    powerStatus === "danger" &&
                      "bg-destructive/20 text-destructive"
                  )}
                >
                  {powerStatus === "good" && "OK"}
                  {powerStatus === "warning" && "Low headroom"}
                  {powerStatus === "danger" && "Insufficient!"}
                </span>
              )}
            </div>
            <span className="font-mono">
              {formatWattage(totalPower)}
              {psuWattage > 0 && (
                <span className="text-muted-foreground">
                  {" / "}
                  {formatWattage(psuWattage)}
                </span>
              )}
            </span>
          </div>

          {psuWattage > 0 && (
            <div className="h-2 rounded-full bg-background overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min((totalPower / psuWattage) * 100, 100)}%`,
                }}
                className={cn(
                  "h-full rounded-full transition-colors",
                  powerStatus === "good" && "bg-neon-green",
                  powerStatus === "warning" && "bg-neon-orange",
                  powerStatus === "danger" && "bg-destructive"
                )}
              />
            </div>
          )}

          <Separator className="bg-border/30" />

          <div className="flex items-center justify-between py-2">
            <span className="font-heading font-semibold">Total</span>
            <span className="font-heading font-bold text-2xl text-neon-green">
              {formatPrice(totalPrice)}
            </span>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1 border-border/50 hover:border-destructive hover:text-destructive"
              onClick={() => {
                if (confirm("Clear all selected components?")) {
                  clearBuild();
                }
              }}
              disabled={completionCount === 0}
            >
              Clear Build
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-neon-green to-neon-cyan text-black font-bold"
              disabled={completionCount < 8 || isNavigatingToSignup}
              onClick={handleSaveClick}
            >
              {isNavigatingToSignup ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Build
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <CompatibilityChecker />

      <SaveBuildDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        onSave={handleSaveBuild}
      />

      {saveError && (
        <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg z-50">
          {saveError}
        </div>
      )}
    </div>
  );
}
