"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBuildStore } from "@/store/build-store";
import { cn } from "@/lib/utils";
import type { AdaptedHeader } from "@/lib/contentstack/adapter";
import type { ExperienceLevelId } from "@/types";

const experienceLevelInfo: Record<
  ExperienceLevelId,
  { displayName: string; icon: string }
> = {
  beginner: { displayName: "First-Time Builder", icon: "🎮" },
  intermediate: { displayName: "Enthusiast", icon: "⚡" },
  advanced: { displayName: "Expert Builder", icon: "🚀" },
};

interface HeaderClientProps {
  headerData: AdaptedHeader;
  user: any;
}

function HeaderContent({
  headerData,
  user,
}: {
  headerData: AdaptedHeader;
  user: any;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { experienceLevel, resetStore, getCompletionCount } = useBuildStore();

  const currentLevel = experienceLevel
    ? experienceLevelInfo[experienceLevel]
    : null;
  const completionCount = getCompletionCount();

  const {
    logo,
    siteName,
    description: tagline,
    navLinks,
    $,
    logo$,
  } = headerData;

  const handleReset = () => {
    if (
      confirm(
        "Reset all selections and start over? You'll need to choose your experience level again."
      )
    ) {
      resetStore();
      router.push("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <Image
              src={logo || ""}
              alt={`${siteName} Logo`}
              width={44}
              height={44}
              className="rounded-lg"
              unoptimized
              {...logo$?.url}
            />
            <div className="absolute inset-0 rounded-lg bg-neon-green/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
          <div className="flex flex-col">
            <span
              className="font-heading font-bold text-lg tracking-wider text-foreground group-hover:text-neon-green transition-colors"
              {...$?.name}
            >
              {siteName}
            </span>
            <span
              className="text-[10px] text-muted-foreground tracking-widest"
              {...$?.description}
            >
              {tagline}
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link, index) => (
            <Link key={link.url || index} href={link.url}>
              <Button
                variant="ghost"
                className={cn(
                  "relative px-4 transition-all",
                  pathname === link.url && "text-neon-green"
                )}
                {...link.$?.title}
              >
                {link.name}
                {pathname === link.url && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-neon-green to-neon-cyan rounded-full" />
                )}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user && (
            <Link href="/dashboard">
              <Button
                variant="ghost"
                className={cn(
                  "relative px-4 transition-all",
                  pathname === "/dashboard" && "text-neon-green"
                )}
              >
                My Builds
                {pathname === "/dashboard" && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-neon-green to-neon-cyan rounded-full" />
                )}
              </Button>
            </Link>
          )}

          {!user && (
            <Link href="/auth/signin">
              <Button
                variant="outline"
                size="sm"
                className="border-neon-green/30 hover:border-neon-green/60 transition-colors"
              >
                Sign In
              </Button>
            </Link>
          )}

          {experienceLevel && pathname === "/builder" && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full glass">
              <div className="flex gap-0.5">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      i < completionCount ? "bg-neon-green" : "bg-muted"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {completionCount}/8
              </span>
            </div>
          )}

          {currentLevel && (
            <Badge
              variant="outline"
              className="gap-1.5 px-3 py-1.5 border-neon-green/30 hover:border-neon-green/60 transition-colors cursor-pointer"
              onClick={() => {
                resetStore();
                router.push("/");
              }}
            >
              <span>{currentLevel.icon}</span>
              <span className="hidden sm:inline">
                {currentLevel.displayName}
              </span>
            </Badge>
          )}

          {!user && experienceLevel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-muted-foreground hover:text-destructive"
            >
              Reset
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export function HeaderClient({ headerData, user }: HeaderClientProps) {
  return <HeaderContent headerData={headerData} user={user} />;
}
