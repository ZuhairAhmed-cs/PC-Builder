"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBuildStore } from "@/store/build-store";
import {
  BuildTemplate,
  ComponentCategory,
  ExperienceLevelId,
  PCComponent,
} from "@/types";
import { cn, formatPrice } from "@/lib/utils";

const experienceLevelInfo: Record<
  ExperienceLevelId,
  { displayName: string; icon: string }
> = {
  beginner: { displayName: "First-Time Builder", icon: "🎮" },
  intermediate: { displayName: "Enthusiast", icon: "⚡" },
  advanced: { displayName: "Expert Builder", icon: "🚀" },
};

interface TemplatesClientProps {
  templates: BuildTemplate[];
}

export function TemplatesClient({ templates }: TemplatesClientProps) {
  const router = useRouter();
  const { experienceLevel, addComponent, clearBuild, setExperienceLevel } =
    useBuildStore();
  const [selectedTemplate, setSelectedTemplate] =
    useState<BuildTemplate | null>(null);

  const handleApplyTemplate = (template: BuildTemplate) => {
    clearBuild();

    if (!experienceLevel) {
      setExperienceLevel(template.targetLevel);
    }

    if (template.components) {
      for (const component of template.components) {
        addComponent(component.category, component);
      }
    }

    router.push("/builder");
  };

  const getLevelInfo = (template: BuildTemplate) => {
    const baseInfo = experienceLevelInfo[template.targetLevel];
    return {
      ...baseInfo,
      icon: template.icon || baseInfo.icon,
    };
  };

  const getComponentByCategory = (
    template: BuildTemplate,
    category: ComponentCategory
  ): PCComponent | undefined => {
    return template.components?.find((c) => c.category === category);
  };

  if (templates.length === 0) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Templates Available</h2>
          <p className="text-muted-foreground">
            Templates will be available soon. Start building from scratch!
          </p>
          <Button
            className="mt-4 bg-neon-green hover:bg-neon-green/90 text-background"
            onClick={() => router.push("/builder")}
          >
            Go to Builder
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
          <span className="text-foreground">Build </span>
          <span className="bg-gradient-to-r from-neon-green to-neon-cyan bg-clip-text text-transparent">
            Templates
          </span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Start with a pre-configured build tailored to your needs. Each
          template is carefully selected for compatibility and performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {templates.map((template, index) => {
          const level = getLevelInfo(template);

          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  "group relative overflow-hidden cursor-pointer transition-all duration-300",
                  "bg-surface/50 backdrop-blur-sm border-border/50",
                  "hover:border-neon-green/50 hover:bg-surface/80",
                  selectedTemplate?.id === template.id && "border-neon-green"
                )}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="aspect-video bg-gradient-to-br from-surface to-background flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-neon-green/10 via-transparent to-neon-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div className="text-6xl">{level.icon}</div>

                  <div className="absolute top-3 right-3">
                    <Badge
                      className="bg-neon-green text-background font-bold text-sm"
                      {...template.$?.price}
                    >
                      {formatPrice(template.totalPrice)}
                    </Badge>
                  </div>

                  <div className="absolute top-3 left-3">
                    <Badge
                      variant="outline"
                      className="border-border/50 bg-background/50 backdrop-blur-sm"
                    >
                      {level.icon} {level.displayName}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3
                    className="font-heading font-bold text-lg mb-1 group-hover:text-neon-green transition-colors"
                    {...template.$?.title}
                  >
                    {template.name}
                  </h3>

                  <p
                    className="text-sm text-neon-cyan mb-2"
                    {...template.$?.use_case}
                  >
                    {template.useCase}
                  </p>

                  <p
                    className="text-sm text-muted-foreground mb-4"
                    {...template.$?.description}
                  >
                    {template.description}
                  </p>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-neon-green hover:bg-neon-green/90 text-background"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyTemplate(template);
                      }}
                    >
                      Use This Build
                    </Button>
                    <Button
                      variant="outline"
                      className="border-border/50"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTemplate(
                          selectedTemplate?.id === template.id ? null : template
                        );
                      }}
                    >
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {selectedTemplate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 max-w-4xl mx-auto"
        >
          <Card className="bg-surface/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2
                    className="font-heading text-2xl font-bold"
                    {...selectedTemplate.$?.title}
                  >
                    {selectedTemplate.name}
                  </h2>
                  <p
                    className="text-muted-foreground"
                    {...selectedTemplate.$?.description}
                  >
                    {selectedTemplate.description}
                  </p>
                </div>
                <Badge
                  className="bg-neon-green text-background font-bold text-lg px-4 py-2"
                  {...selectedTemplate.$?.price}
                >
                  {formatPrice(selectedTemplate.totalPrice)}
                </Badge>
              </div>

              <h3 className="font-heading font-semibold mb-4">
                Included Components
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(
                  [
                    "cpu",
                    "gpu",
                    "motherboard",
                    "ram",
                    "storage",
                    "psu",
                    "case",
                    "cooling",
                  ] as ComponentCategory[]
                ).map((category) => {
                  const component = getComponentByCategory(
                    selectedTemplate,
                    category
                  );
                  if (!component) return null;

                  return (
                    <div
                      key={category}
                      className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/30"
                    >
                      {component.image && (
                        <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center overflow-hidden">
                          <Image
                            src={component.image}
                            alt={component.title}
                            width={48}
                            height={48}
                            className="object-cover"
                            loading="lazy"
                            {...(component.image$ && component.image$.url)}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground capitalize">
                          {category}
                        </p>
                        <p
                          className="text-sm font-medium truncate"
                          {...component.$?.title}
                        >
                          {component.title}
                        </p>
                        <p
                          className="text-xs text-neon-green font-mono"
                          {...component.$?.price}
                        >
                          {formatPrice(component.price)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  size="lg"
                  className="bg-neon-green hover:bg-neon-green/90 text-background"
                  onClick={() => handleApplyTemplate(selectedTemplate)}
                >
                  Apply This Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </main>
  );
}
