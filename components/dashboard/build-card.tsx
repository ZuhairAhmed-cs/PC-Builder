"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Share2,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  Mail,
  Loader2,
} from "lucide-react";

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

interface BuildCardProps {
  build: Build;
  onDelete: (id: string) => void;
  onTogglePublic: (id: string, isPublic: boolean) => void;
}

const experienceLevelColors = {
  beginner: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  intermediate: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  advanced: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

export function BuildCard({ build, onDelete, onTogglePublic }: BuildCardProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isTogglingPublic, setIsTogglingPublic] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const shareUrl = `${window.location.origin}/share/${build.share_token}`;
  const componentCount = Object.values(build.components).filter(Boolean).length;

  const handleCardClick = () => {
    setIsNavigating(true);
    router.push(`/share/${build.share_token}`);
  };

  const handleTogglePublic = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTogglingPublic(true);
    try {
      await onTogglePublic(build.id, !build.is_public);
    } finally {
      setIsTogglingPublic(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this build?")) return;
    setIsDeleting(true);
    try {
      await onDelete(build.id);
    } catch (error) {
      console.error("Failed to delete build:", error);
      setIsDeleting(false);
      alert("Failed to delete build. Please try again.");
    }
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleEmailParts = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setEmailSending(true);
    try {
      const response = await fetch(
        `/api/builds/share/${build.share_token}/email-parts`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 3000);
      } else {
        alert("Failed to send email. Please try again.");
      }
    } catch (error) {
      console.error("Failed to send email:", error);
      alert("Failed to send email. Please try again.");
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <div
      className={`relative rounded-xl border border-border/50 bg-surface/30 backdrop-blur-sm p-6 hover:border-neon-green/30 transition-all cursor-pointer ${
        isNavigating || isDeleting ? "pointer-events-none" : ""
      }`}
      onClick={handleCardClick}
    >
      {(isNavigating || isDeleting) && (
        <div className="absolute inset-0 rounded-xl bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-neon-green" />
            <span className="text-sm text-muted-foreground">
              {isDeleting ? "Deleting..." : "Loading..."}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-heading font-bold mb-1">{build.name}</h3>
          {build.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {build.description}
            </p>
          )}
        </div>
        <Badge
          className={
            experienceLevelColors[
              build.experience_level as keyof typeof experienceLevelColors
            ]
          }
        >
          {build.experience_level}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Components:</span>
          <span className="font-medium">{componentCount}</span>
        </div>
        {build.total_price && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Price:</span>
            <span className="font-medium text-neon-green">
              ${build.total_price.toFixed(2)}
            </span>
          </div>
        )}
        {build.is_public && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Views:</span>
            <span className="font-medium">{build.view_count}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTogglePublic}
            disabled={isTogglingPublic}
            className="flex-1"
          >
            {isTogglingPublic ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {build.is_public ? "Making Private..." : "Making Public..."}
              </>
            ) : build.is_public ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Make Private
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Make Public
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-destructive hover:text-destructive"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        </div>

        <div className="flex gap-2">
          {build.is_public && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="flex-1"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Link
                </>
              )}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleEmailParts}
            disabled={emailSending || emailSent}
            className="flex-1 bg-gradient-to-r from-neon-green/10 to-neon-cyan/10 hover:from-neon-green/20 hover:to-neon-cyan/20"
          >
            {emailSent ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Sent!
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                {emailSending ? "Sending..." : "Email Parts"}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border/30">
        <p className="text-xs text-muted-foreground">
          Updated {new Date(build.updated_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
