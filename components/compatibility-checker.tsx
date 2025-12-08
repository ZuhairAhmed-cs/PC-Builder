"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBuildStore } from "@/store/build-store";
import { checkCompatibility } from "@/lib/compatibility";
import { CompatibilityIssue } from "@/types";
import { cn } from "@/lib/utils";

export function CompatibilityChecker() {
  const { selectedComponents, getCompletionCount } = useBuildStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const completionCount = getCompletionCount();

  const compatibilityResult = useMemo(() => {
    return checkCompatibility(selectedComponents);
  }, [selectedComponents]);

  const { isCompatible, errors, warnings } = compatibilityResult;
  const totalIssues = errors.length + warnings.length;

  if (completionCount === 0) {
    return null;
  }

  return (
    <Card
      className={cn(
        "bg-surface/50 backdrop-blur-sm border-border/50 overflow-hidden transition-colors",
        errors.length > 0 && "border-destructive/50",
        errors.length === 0 && warnings.length > 0 && "border-neon-orange/50",
        isCompatible && warnings.length === 0 && "border-neon-green/50"
      )}
    >
      <CardHeader
        className="pb-2 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="font-heading text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            {errors.length > 0 ? (
              <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-destructive"
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
              </div>
            ) : warnings.length > 0 ? (
              <div className="w-5 h-5 rounded-full bg-neon-orange/20 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-neon-orange"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-neon-green/20 flex items-center justify-center">
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
              </div>
            )}

            <span>Compatibility</span>

            {totalIssues > 0 && (
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  errors.length > 0
                    ? "bg-destructive/20 text-destructive"
                    : "bg-neon-orange/20 text-neon-orange"
                )}
              >
                {totalIssues} {totalIssues === 1 ? "issue" : "issues"}
              </span>
            )}
          </div>

          <svg
            className={cn(
              "w-4 h-4 transition-transform text-muted-foreground",
              isExpanded && "rotate-180"
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
        </CardTitle>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0 space-y-3">
              {isCompatible && totalIssues === 0 && (
                <p className="text-sm text-neon-green flex items-center gap-2">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  All selected components are compatible!
                </p>
              )}

              {errors.map((issue, index) => (
                <IssueItem key={`error-${index}`} issue={issue} />
              ))}

              {warnings.map((issue, index) => (
                <IssueItem key={`warning-${index}`} issue={issue} />
              ))}

              {completionCount < 8 && totalIssues === 0 && (
                <p className="text-xs text-muted-foreground">
                  Continue adding components to complete your build. We&apos;ll
                  check compatibility as you go.
                </p>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function IssueItem({ issue }: { issue: CompatibilityIssue }) {
  const isError = issue.type === "error";

  return (
    <div
      className={cn(
        "p-3 rounded-lg border",
        isError
          ? "bg-destructive/10 border-destructive/30"
          : "bg-neon-orange/10 border-neon-orange/30"
      )}
    >
      <div className="flex items-start gap-2">
        {isError ? (
          <svg
            className="w-4 h-4 text-destructive mt-0.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4 text-neon-orange mt-0.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        )}
        <div>
          <h4
            className={cn(
              "text-sm font-semibold",
              isError ? "text-destructive" : "text-neon-orange"
            )}
          >
            {issue.title}
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            {issue.description}
          </p>
        </div>
      </div>
    </div>
  );
}
