"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBuildStore } from "@/store/build-store";
import { PCComponent } from "@/types";
import {
  cn,
  formatPrice,
  getDescription,
  getSpecifications,
  getStockStatusColor,
  getStockStatusText,
} from "@/lib/utils";

interface ComponentCardProps {
  component: PCComponent;
  isSelected?: boolean;
  onPriceCompare?: (component: PCComponent) => void;
  onSelect?: () => void;
}

export function ComponentCard({
  component,
  isSelected = false,
  onPriceCompare,
  onSelect,
}: ComponentCardProps) {
  const [showSpecs, setShowSpecs] = useState(false);
  const { experienceLevel, addComponent, removeComponent } = useBuildStore();
  const level = experienceLevel || "beginner";

  const description = getDescription(component, level);
  const specifications = getSpecifications(component, level);

  const handleAddToBuild = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSelected) {
      removeComponent(component.category);
    } else {
      addComponent(component.category, component);
      onSelect?.();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "group relative overflow-hidden transition-all duration-300",
          "bg-surface/50 backdrop-blur-sm border-border/50",
          "hover:border-neon-green/30 hover:bg-surface/80",
          isSelected && "border-neon-green bg-surface/80 glow-green"
        )}
      >
        {isSelected && (
          <div className="absolute top-3 right-3 z-10">
            <Badge className="bg-neon-green text-background font-semibold">
              Selected
            </Badge>
          </div>
        )}

        <CardContent className="p-4">
          <div className="relative aspect-square mb-4 rounded-lg bg-background/50 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              {component.image && !component.image.includes("placeholder") ? (
                <Image
                  src={component.image}
                  alt={component.title}
                  fill
                  className="object-contain p-2"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIRAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBQYSIRMxQWH/xAAVAQEBAAAAAAAAAAAAAAAAAAACBf/EABgRAQADAQAAAAAAAAAAAAAAAAEAAhEh/9oADAMBAAIRAxEAPwC9s3aNhq+nXF3eXN0khuJECxyAbVDAfh9nJJ/KKKK5Nm1LP//Z"
                  {...(component.image$ && component.image$.url)}
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-surface to-background flex items-center justify-center">
                  <span className="text-4xl opacity-50">
                    {component.category === "cpu" && "🔲"}
                    {component.category === "gpu" && "🎴"}
                    {component.category === "motherboard" && "📟"}
                    {component.category === "ram" && "📊"}
                    {component.category === "storage" && "💾"}
                    {component.category === "psu" && "⚡"}
                    {component.category === "case" && "🖥️"}
                    {component.category === "cooling" && "❄️"}
                  </span>
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>

          <p
            className="text-xs text-muted-foreground mb-1"
            {...component.$?.brand}
          >
            {component.brand}
          </p>

          <h3
            className="font-heading font-semibold text-sm mb-2 line-clamp-2 group-hover:text-neon-green transition-colors"
            {...component.$?.title}
          >
            {component.title}
          </h3>

          <p
            className="text-xs text-muted-foreground mb-3 line-clamp-2"
            {...component.$?.description}
          >
            {description}
          </p>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSpecs(!showSpecs);
            }}
            className="text-xs text-neon-cyan hover:text-neon-green transition-colors mb-3 flex items-center gap-1"
          >
            {showSpecs ? "Hide" : "Show"} Specs
            <svg
              className={cn(
                "w-3 h-3 transition-transform",
                showSpecs && "rotate-180"
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showSpecs && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-3 p-2 rounded-lg bg-background/50 border border-border/30"
            >
              <div className="space-y-1">
                {Object.entries(specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{key}</span>
                    <span className="text-foreground font-mono">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <div className="flex items-center justify-between mb-3">
            <span
              className="font-heading font-bold text-lg text-neon-green"
              {...component.$?.price}
            >
              {formatPrice(component.price)}
            </span>
            <span
              className={cn(
                "text-xs",
                getStockStatusColor(component.stockStatus)
              )}
            >
              {getStockStatusText(component.stockStatus)}
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={(e) => handleAddToBuild(e)}
              disabled={component.stockStatus === "out_of_stock"}
              className={cn(
                "flex-1 transition-all",
                isSelected
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-neon-green hover:bg-neon-green/90 text-background"
              )}
            >
              {isSelected ? "Remove" : "Add to Build"}
            </Button>
            {onPriceCompare && (
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onPriceCompare(component);
                }}
                className="border-border/50 hover:border-neon-cyan hover:text-neon-cyan"
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </Button>
            )}
          </div>

          {component.socketType && (
            <p className="mt-2 text-[10px] text-muted-foreground">
              Socket: {component.socketType}
            </p>
          )}
          {component.formFactor && (
            <p className="text-[10px] text-muted-foreground">
              Form Factor: {component.formFactor}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
