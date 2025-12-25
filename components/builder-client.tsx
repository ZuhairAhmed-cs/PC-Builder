"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ComponentSelector } from "@/components/component-selector";
import { BuildSummary } from "@/components/build-summary";
import { PriceComparison } from "@/components/price-comparison";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBuildStore } from "@/store/build-store";
import { PCComponent } from "@/types";
import type { ComponentsByCategory } from "@/lib/contentstack/adapter";

// Dynamic import for 3D viewer to avoid SSR issues
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
  const { experienceLevel, getCompletionCount } = useBuildStore();
  const [priceCompareComponent, setPriceCompareComponent] =
    useState<PCComponent | null>(null);
  const [viewMode, setViewMode] = useState<"components" | "3d">("components");
  const [theaterMode, setTheaterMode] = useState(false);

  const completionCount = getCompletionCount();

  // Extract categories from componentsByCategory data
  const categories = useMemo(
    () => componentsByCategory.map((item) => item.category),
    [componentsByCategory]
  );

  // Redirect to home if no experience level selected
  useEffect(() => {
    if (!experienceLevel) {
      router.push("/");
    }
  }, [experienceLevel, router]);

  // Don't render until we've checked for experience level
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
          {/* Main Content */}
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

          {/* Sidebar - Build Summary (hidden in theater mode when viewing 3D) */}
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

      {/* Price Comparison Modal */}
      <PriceComparison
        component={priceCompareComponent}
        open={priceCompareComponent !== null}
        onClose={() => setPriceCompareComponent(null)}
      />
    </>
  );
}

