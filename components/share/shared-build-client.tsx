"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PCViewer } from "@/components/3d/pc-viewer";
import { Eye, Copy, Check, ArrowLeft, Mail, User, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useBuildStore } from "@/store/build-store";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";

interface Build {
  id: string;
  name: string;
  description: string | null;
  experience_level: string;
  components: any;
  total_price: number | null;
  view_count: number;
  created_at: string;
}

interface CreatorInfo {
  name: string | null;
  email: string | null;
}

interface SharedBuildClientProps {
  build: Build;
  creatorInfo?: CreatorInfo | null;
}

const experienceLevelInfo = {
  beginner: { displayName: "First-Time Builder", icon: "🎮" },
  intermediate: { displayName: "Enthusiast", icon: "⚡" },
  advanced: { displayName: "Expert Builder", icon: "🚀" },
};

export function SharedBuildClient({
  build,
  creatorInfo,
}: SharedBuildClientProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);
  const [isNavigatingToBuild, setIsNavigatingToBuild] = useState(false);
  const experienceLevel = useBuildStore((state) => state.experienceLevel);

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

  const handleBackToHome = () => {
    setIsNavigatingBack(true);
    if (isAuthenticated) {
      router.push("/dashboard");
    } else if (experienceLevel) {
      router.push("/builder");
    } else {
      router.push("/");
    }
  };

  const levelInfo =
    experienceLevelInfo[
      build.experience_level as keyof typeof experienceLevelInfo
    ];
  const componentCount = Object.values(build.components).filter(Boolean).length;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleEmailParts = async () => {
    setEmailSending(true);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setEmailSending(false);
        const currentUrl = window.location.pathname;
        const token = currentUrl.split("/").pop();
        router.push(
          `/auth/signup?action=email-parts&token=${token}&redirect=${encodeURIComponent(
            currentUrl
          )}`
        );
        return;
      }

      const token = window.location.pathname.split("/").pop();
      const response = await fetch(`/api/builds/share/${token}/email-parts`, {
        method: "POST",
      });

      if (response.ok) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 3000);
      } else {
        const errorData = await response.json();
        alert(
          `Failed to send email: ${errorData.error || "Please try again."}`
        );
      }
    } catch (error) {
      console.error("Failed to send email:", error);
      alert("Failed to send email. Please try again.");
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBackToHome}
            disabled={isNavigatingBack}
            className="mb-4"
          >
            {isNavigatingBack ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Navigating...
              </>
            ) : (
              <>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </>
            )}
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-heading font-bold mb-2 bg-gradient-to-r from-neon-green to-neon-cyan bg-clip-text text-transparent">
                {build.name}
              </h1>
              {build.description && (
                <p className="text-muted-foreground text-lg mb-4">
                  {build.description}
                </p>
              )}
              <div className="flex items-center gap-4 flex-wrap">
                <Badge className="bg-neon-green/10 text-neon-green border-neon-green/30">
                  {levelInfo.icon} {levelInfo.displayName}
                </Badge>
                {creatorInfo && (creatorInfo.name || creatorInfo.email) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>
                      by {creatorInfo.name || creatorInfo.email?.split("@")[0]}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  <span>{build.view_count} views</span>
                </div>
                <span
                  className="text-sm text-muted-foreground"
                  suppressHydrationWarning
                >
                  Created {new Date(build.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" onClick={handleCopyLink}>
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>
              <Button
                onClick={handleEmailParts}
                disabled={emailSending || emailSent}
                className="bg-gradient-to-r from-neon-green to-neon-cyan text-black font-bold"
              >
                {emailSent ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Email Sent!
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    {emailSending ? "Sending..." : "Get Parts List via Email"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="rounded-xl border border-border/50 bg-surface/30 backdrop-blur-sm p-6">
              <h2 className="text-2xl font-heading font-bold mb-4">
                Build Summary
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Components:</span>
                  <span className="font-medium">{componentCount}</span>
                </div>
                {build.total_price && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Price:</span>
                    <span className="font-bold text-2xl text-neon-green">
                      {formatPrice(build.total_price)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-surface/30 backdrop-blur-sm p-6">
              <h2 className="text-2xl font-heading font-bold mb-4">
                Components
              </h2>
              <div className="space-y-4">
                {Object.entries(build.components).map(
                  ([category, component]: [string, any]) => {
                    if (!component) return null;
                    const componentName =
                      component.name || component.title || "Unknown Component";
                    return (
                      <div
                        key={category}
                        className="flex items-start gap-4 p-4 rounded-lg bg-background/50 border border-border/30"
                      >
                        {component.image && (
                          <img
                            src={component.image}
                            alt={componentName}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground uppercase mb-1">
                            {category}
                          </p>
                          <p className="font-medium truncate">
                            {componentName}
                          </p>
                          {component.price && (
                            <p className="text-sm text-neon-green">
                              {formatPrice(component.price)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-8 h-fit">
            <div className="rounded-xl border border-border/50 bg-surface/30 backdrop-blur-sm p-6">
              <h2 className="text-2xl font-heading font-bold mb-4">
                3D Preview
              </h2>
              <PCViewer
                className="h-[600px]"
                forceShow={true}
                componentCount={componentCount}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button
            onClick={() => {
              setIsNavigatingToBuild(true);
              if (experienceLevel) {
                router.push("/builder");
              } else {
                router.push("/");
              }
            }}
            disabled={isNavigatingToBuild}
            className="bg-gradient-to-r from-neon-green to-neon-cyan text-black hover:opacity-90"
          >
            {isNavigatingToBuild ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Build Your Own PC"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
