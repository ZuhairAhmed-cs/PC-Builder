"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBuildStore } from "@/store/build-store";

/**
 * Client component that redirects to builder if user already has an experience level selected
 * This is separated from the Server Component to allow server-side data fetching
 */
export function HomeRedirectCheck() {
  const router = useRouter();
  const { experienceLevel } = useBuildStore();

  useEffect(() => {
    if (experienceLevel) {
      router.push("/builder");
    }
  }, [experienceLevel, router]);

  // This component doesn't render anything visible
  return null;
}

