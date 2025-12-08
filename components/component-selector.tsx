"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ComponentCard } from "@/components/component-card";
import { useBuildStore } from "@/store/build-store";
import type { ComponentsByCategory } from "@/lib/contentstack/adapter";
import { PCComponent, ComponentCategory } from "@/types";
import { cn } from "@/lib/utils";

interface ComponentSelectorProps {
  componentsByCategory: ComponentsByCategory[];
  onPriceCompare?: (component: PCComponent) => void;
}

export function ComponentSelector({
  componentsByCategory,
  onPriceCompare,
}: ComponentSelectorProps) {
  const { activeCategory, setActiveCategory, selectedComponents } =
    useBuildStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"price" | "name" | "brand">("price");

  const categories = useMemo(
    () => componentsByCategory.map((item) => item.category),
    [componentsByCategory]
  );

  const componentsMap = useMemo(() => {
    const map: Record<string, PCComponent[]> = {};
    for (const group of componentsByCategory) {
      map[group.category.id] = group.components;
    }
    return map;
  }, [componentsByCategory]);

  const components = useMemo(() => {
    let filtered = componentsMap[activeCategory] || [];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.brand.toLowerCase().includes(query)
      );
    }

    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price":
          return a.price - b.price;
        case "name":
          return a.title.localeCompare(b.title);
        case "brand":
          return a.brand.localeCompare(b.brand);
        default:
          return 0;
      }
    });

    return filtered;
  }, [activeCategory, searchQuery, sortBy, componentsMap]);

  const selectedComponent = selectedComponents[activeCategory];
  const categoryInfo = categories.find((c) => c.id === activeCategory);

  const handleAutoAdvance = () => {
    const currentIndex = categories.findIndex((c) => c.id === activeCategory);
    if (currentIndex >= 0 && currentIndex < categories.length - 1) {
      const nextCategory = categories[currentIndex + 1];
      if (nextCategory && !selectedComponents[nextCategory.id]) {
        setTimeout(() => {
          setActiveCategory(nextCategory.id);
        }, 500);
      }
    }
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No categories available. Please add categories in Contentstack.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto pb-2">
        <Tabs
          value={activeCategory}
          onValueChange={(v) => setActiveCategory(v as ComponentCategory)}
        >
          <TabsList className="bg-surface/50 p-1 gap-1 flex-nowrap">
            {categories.map((category) => {
              const isSelected = selectedComponents[category.id] !== null;

              return (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className={cn(
                    "relative px-4 py-2 data-[state=active]:bg-background",
                    "transition-all whitespace-nowrap",
                    isSelected && "text-neon-green"
                  )}
                >
                  <span className="mr-2" {...category.$?.icon}>
                    {category.icon}
                  </span>
                  <span
                    className="hidden sm:inline"
                    {...category.$?.display_name}
                  >
                    {category.name}
                  </span>

                  {isSelected && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-neon-green" />
                  )}

                  {activeCategory === category.id && (
                    <motion.span
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-neon-green to-neon-cyan"
                    />
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold flex items-center gap-3">
            <span {...categoryInfo?.$?.icon}>{categoryInfo?.icon}</span>
            <span {...categoryInfo?.$?.display_name}>
              Select {categoryInfo?.name}
            </span>
          </h2>
          <p
            className="text-sm text-muted-foreground mt-1"
            {...categoryInfo?.$?.description}
          >
            {categoryInfo?.description}
          </p>
        </div>

        {selectedComponent && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Currently selected</p>
            <p className="text-sm font-medium text-neon-green">
              {selectedComponent.title}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-surface/50 border-border/50 focus:border-neon-green"
          />
        </div>
        <Select
          value={sortBy}
          onValueChange={(v) => setSortBy(v as typeof sortBy)}
        >
          <SelectTrigger className="w-full sm:w-[180px] bg-surface/50 border-border/50">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price">Price: Low to High</SelectItem>
            <SelectItem value="name">Name: A to Z</SelectItem>
            <SelectItem value="brand">Brand: A to Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {components.map((component) => (
            <ComponentCard
              key={component.id}
              component={component}
              isSelected={selectedComponent?.id === component.id}
              onPriceCompare={onPriceCompare}
              onSelect={handleAutoAdvance}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {components.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery
              ? "No components found matching your search."
              : "No components available for this category."}
          </p>
        </div>
      )}
    </div>
  );
}
