"use client";

import { useEffect, useState, createContext, useContext } from "react";
import {
  isIndexedDBAvailable,
  isGLBCached,
  fetchAndCacheGLB,
} from "@/lib/utils/glb-cache";

interface ModelPreloadContextValue {
  isPreloading: boolean;
  isPreloaded: boolean;
  error: string | null;
}

const ModelPreloadContext = createContext<ModelPreloadContextValue>({
  isPreloading: false,
  isPreloaded: false,
  error: null,
});

export function useModelPreload(): ModelPreloadContextValue {
  return useContext(ModelPreloadContext);
}

interface ModelPreloaderProps {
  children: React.ReactNode;
}

export function ModelPreloader({ children }: ModelPreloaderProps) {
  const [isPreloading, setIsPreloading] = useState(false);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    let mounted = true;
    setIsPreloading(true);

    async function preloadModel() {
      try {
        if (!isIndexedDBAvailable()) {
          console.warn("IndexedDB not available, skipping preload cache");
          if (mounted) setIsPreloading(false);
          return;
        }

        const cached = await isGLBCached();

        if (cached) {
          if (mounted) {
            setIsPreloaded(true);
            setIsPreloading(false);
          }
          return;
        }

        const blob = await fetchAndCacheGLB();

        if (mounted) {
          if (blob) {
            setIsPreloaded(true);
          } else {
            console.warn("Failed to preload GLB model");
            setError("Failed to preload 3D model");
          }
          setIsPreloading(false);
        }
      } catch (err) {
        console.error("Error preloading GLB model:", err);
        if (mounted) {
          setError(err instanceof Error ? err.message : "Preload failed");
          setIsPreloading(false);
        }
      }
    }

    preloadModel();

    return () => {
      mounted = false;
    };
  }, [isMounted]);

  return (
    <ModelPreloadContext.Provider value={{ isPreloading, isPreloaded, error }}>
      {children}
    </ModelPreloadContext.Provider>
  );
}
