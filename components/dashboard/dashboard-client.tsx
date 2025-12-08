"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BuildCard } from "./build-card";
import { SaveBuildDialog } from "./save-build-dialog";
import { useBuildStore } from "@/store/build-store";
import { Plus, LogOut, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Build {
  id: string;
  name: string;
  description: string | null;
  experience_level: string;
  components: any;
  total_price: number | null;
  share_token: string;
  is_public: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

interface DashboardClientProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function DashboardClient({ user }: DashboardClientProps) {
  const router = useRouter();
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingBuild, setIsCreatingBuild] = useState(false);
  const { resetStore, setIsNavigatingAway } = useBuildStore();

  useEffect(() => {
    setIsNavigatingAway(false);
    fetchBuilds();
  }, [setIsNavigatingAway]);

  const fetchBuilds = async () => {
    try {
      const response = await fetch("/api/builds");
      if (response.ok) {
        const data = await response.json();
        setBuilds(data.builds || []);
      }
    } catch (error) {
      console.error("Error fetching builds:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (buildId: string) => {
    const response = await fetch(`/api/builds/${buildId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete build");
    }

    setBuilds(builds.filter((b) => b.id !== buildId));
  };

  const handleTogglePublic = async (buildId: string, isPublic: boolean) => {
    try {
      const response = await fetch(`/api/builds/${buildId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic }),
      });

      if (response.ok) {
        setBuilds(
          builds.map((b) =>
            b.id === buildId ? { ...b, is_public: isPublic } : b
          )
        );
      }
    } catch (error) {
      console.error("Error updating build:", error);
    }
  };

  const handleNewBuild = () => {
    setIsCreatingBuild(true);
    resetStore();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-heading font-bold mb-2 bg-gradient-to-r from-neon-green to-neon-cyan bg-clip-text text-transparent">
              My Builds
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {user.name || user.email}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleNewBuild}
              disabled={isCreatingBuild}
              className="bg-gradient-to-r from-neon-green to-neon-cyan text-black hover:opacity-90"
            >
              {isCreatingBuild ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  New Build
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                router.push("/");
                router.refresh();
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
          </div>
        ) : builds.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-surface/50 flex items-center justify-center">
              <Plus className="w-10 h-10 opacity-50" />
            </div>
            <h2 className="text-2xl font-heading font-bold mb-2">
              No builds yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Start building your dream PC and save it here
            </p>
            <Button onClick={handleNewBuild} disabled={isCreatingBuild}>
              {isCreatingBuild ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Create Your First Build"
              )}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {builds.map((build) => (
              <BuildCard
                key={build.id}
                build={build}
                onDelete={handleDelete}
                onTogglePublic={handleTogglePublic}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
