"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ComponentSelector } from "@/components/component-selector";
import { BuildSummary } from "@/components/build-summary";
import { PriceComparison } from "@/components/price-comparison";
import { SaveBuildDialog } from "@/components/dashboard/save-build-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useBuildStore } from "@/store/build-store";
import { createClient } from "@/lib/supabase/client";
import { Save } from "lucide-react";
import { PCComponent } from "@/types";
import type { ComponentsByCategory } from "@/lib/contentstack/adapter";

const PCViewer = dynamic(
  () => import("@/components/3d/pc-viewer").then((mod) => mod.PCViewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] flex items-center justify-center bg-surface/50 rounded-xl">
        <div className="animate-pulse text-muted-foreground">
          Loading 3D viewer...
        </div>
      </div>
    ),
  }
);

interface BuilderClientProps {
  componentsByCategory: ComponentsByCategory[];
}

export function BuilderClient({ componentsByCategory }: BuilderClientProps) {
  const router = useRouter();
  const {
    experienceLevel,
    getCompletionCount,
    selectedComponents,
    resetStore,
    isNavigatingAway,
    setIsNavigatingAway,
  } = useBuildStore();
  const [priceCompareComponent, setPriceCompareComponent] =
    useState<PCComponent | null>(null);
  const [viewMode, setViewMode] = useState<"components" | "3d">("components");
  const [theaterMode, setTheaterMode] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const completionCount = getCompletionCount();
  const hasComponents = Object.values(selectedComponents).some(Boolean);

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
      const totalPrice = Object.values(selectedComponents)
        .filter(Boolean)
        .reduce(
          (sum: number, component: any) => sum + (component.price || 0),
          0
        );

      const pendingBuild = {
        experienceLevel,
        components: selectedComponents,
        totalPrice,
      };
      localStorage.setItem("pendingBuild", JSON.stringify(pendingBuild));

      router.push("/auth/signup?action=save");
    } else {
      setShowSaveDialog(true);
    }
  };

  const handleClearBuild = () => {
    if (confirm("Are you sure you want to clear all selected components?")) {
      resetStore();
      router.push("/");
    }
  };

  const handleSaveBuild = async (name: string, description: string) => {
    setSaveError(null);

    try {
      const totalPrice = Object.values(selectedComponents)
        .filter(Boolean)
        .reduce(
          (sum: number, component: any) => sum + (component.price || 0),
          0
        );

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

  const categories = useMemo(
    () => componentsByCategory.map((item) => item.category),
    [componentsByCategory]
  );

  useEffect(() => {
    if (!experienceLevel && !isNavigatingAway) {
      router.push("/");
    }
  }, [experienceLevel, router, isNavigatingAway]);

  if (!experienceLevel) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-6">
        <div
          className={`flex flex-col lg:flex-row gap-6 ${
            theaterMode && viewMode === "3d" ? "lg:flex-col" : ""
          }`}
        >
          <div
            className={`flex-1 min-w-0 ${
              theaterMode && viewMode === "3d" ? "w-full" : ""
            }`}
          >
            <Tabs
              value={viewMode}
              onValueChange={(v) => setViewMode(v as typeof viewMode)}
            >
              <div className="flex items-center justify-between mb-6">
                <TabsList className="bg-surface/50">
                  <TabsTrigger
                    value="components"
                    className="data-[state=active]:bg-background"
                  >
                    🔧 Components
                  </TabsTrigger>
                  <TabsTrigger
                    value="3d"
                    className="data-[state=active]:bg-background"
                  >
                    🎮 3D View
                  </TabsTrigger>
                </TabsList>

                {viewMode === "3d" && completionCount === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Select components to see your build in 3D
                  </p>
                )}
              </div>

              <TabsContent value="components" className="mt-0">
                <ComponentSelector
                  componentsByCategory={componentsByCategory}
                  onPriceCompare={(component) =>
                    setPriceCompareComponent(component)
                  }
                />
              </TabsContent>

              <TabsContent value="3d" className="mt-0">
                <Card className="bg-surface/50 border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-heading text-lg">
                      3D Build Visualization
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 sm:p-4">
                    <PCViewer
                      theaterMode={theaterMode}
                      onTheaterModeChange={setTheaterMode}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div
            className={`lg:w-[380px] shrink-0 ${
              theaterMode && viewMode === "3d" ? "hidden" : ""
            }`}
          >
            <div className="lg:sticky lg:top-24">
              <BuildSummary categories={categories} />
            </div>
          </div>
        </div>
      </div>

      <PriceComparison
        component={priceCompareComponent}
        open={priceCompareComponent !== null}
        onClose={() => setPriceCompareComponent(null)}
      />

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
    </>
  );
}
