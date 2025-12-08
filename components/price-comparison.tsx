"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PCComponent } from "@/types";
import { cn, formatPrice } from "@/lib/utils";

interface PriceComparisonProps {
  component: PCComponent | null;
  open: boolean;
  onClose: () => void;
}

export function PriceComparison({
  component,
  open,
  onClose,
}: PriceComparisonProps) {
  if (!component) return null;

  const productLinks = component.productLinks;
  const prices = Object.entries(productLinks)
    .filter(([, link]) => link)
    .map(([retailer, link]) => ({
      retailer,
      name: retailer.charAt(0).toUpperCase() + retailer.slice(1),
      price: link!.price,
      url: link!.url,
      lastUpdated: link!.lastUpdated,
    }))
    .sort((a, b) => a.price - b.price);

  const lowestPrice = prices.length > 0 ? prices[0].price : component.price;
  const basePrice = component.price;
  const savings = basePrice - lowestPrice;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-surface border-border/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">
            Price Comparison
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-lg bg-background/50">
            {component.image && (
              <div className="w-16 h-16 rounded-lg bg-surface flex items-center justify-center overflow-hidden">
                <Image
                  src={component.image}
                  alt={component.title}
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
            )}
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{component.brand}</p>
              <h3 className="font-semibold text-sm">{component.title}</h3>
              {savings > 0 && (
                <Badge className="mt-2 bg-neon-green/20 text-neon-green border-0">
                  Save up to {formatPrice(savings)}
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {prices.map((retailer, index) => (
              <div
                key={retailer.retailer}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-colors",
                  index === 0
                    ? "bg-neon-green/10 border-neon-green/30"
                    : "bg-background/50 border-border/30 hover:border-border/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium text-sm">{retailer.name}</p>
                    {retailer.lastUpdated && (
                      <p className="text-[10px] text-muted-foreground">
                        Updated: {retailer.lastUpdated}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p
                      className={cn(
                        "font-heading font-bold",
                        index === 0 ? "text-neon-green" : "text-foreground"
                      )}
                    >
                      {formatPrice(retailer.price)}
                    </p>
                    {index === 0 && prices.length > 1 && (
                      <p className="text-[10px] text-neon-green">
                        Lowest price
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={index === 0 ? "default" : "outline"}
                    className={cn(
                      index === 0 &&
                        "bg-neon-green hover:bg-neon-green/90 text-background"
                    )}
                    onClick={() => window.open(retailer.url, "_blank")}
                  >
                    Buy
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {prices.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No retailer prices available for this component.</p>
              <p className="text-sm mt-2">
                Listed price: {formatPrice(component.price)}
              </p>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground text-center">
            Prices may vary. Links may contain affiliate codes.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
