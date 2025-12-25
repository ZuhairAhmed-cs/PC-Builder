"use client";

import { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from "react";

// Import model-viewer only on client side
let modelViewerLoaded = false;

interface ModelViewerWrapperProps {
  src: string;
  alt?: string;
  poster?: string;
  autoRotate?: boolean;
  cameraControls?: boolean;
  shadowIntensity?: number;
  shadowSoftness?: number;
  exposure?: number;
  environmentImage?: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export interface ModelViewerRef {
  enterFullscreen: () => void;
  exitFullscreen: () => void;
  isFullscreen: () => boolean;
}

export const ModelViewerWrapper = forwardRef<ModelViewerRef, ModelViewerWrapperProps>(
  function ModelViewerWrapper(
    {
      src,
      alt = "3D Model",
      poster,
      autoRotate = true,
      cameraControls = true,
      shadowIntensity = 1,
      shadowSoftness = 1,
      exposure = 1,
      environmentImage = "neutral",
      className = "",
      style,
      onLoad,
      onError,
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [modelViewerElement, setModelViewerElement] = useState<HTMLElement | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load model-viewer script
    useEffect(() => {
      if (modelViewerLoaded) {
        setIsReady(true);
        return;
      }

      import("@google/model-viewer")
        .then(() => {
          modelViewerLoaded = true;
          setIsReady(true);
        })
        .catch((err) => {
          console.error("Failed to load model-viewer:", err);
          setError("Failed to load 3D viewer");
          onError?.(err);
        });
    }, [onError]);

    // Set up event listeners when model-viewer element is available
    useEffect(() => {
      if (!modelViewerElement) return;

      const handleLoad = () => {
        console.log("Model loaded successfully");
        setIsLoading(false);
        onLoad?.();
      };

      const handleError = () => {
        console.error("Model failed to load");
        setIsLoading(false);
        setError("Failed to load 3D model");
        onError?.(new Error("Failed to load 3D model"));
      };

      modelViewerElement.addEventListener("load", handleLoad);
      modelViewerElement.addEventListener("error", handleError);

      return () => {
        modelViewerElement.removeEventListener("load", handleLoad);
        modelViewerElement.removeEventListener("error", handleError);
      };
    }, [modelViewerElement, onLoad, onError]);

    // Ref callback to capture the model-viewer element
    const handleModelViewerRef = useCallback((element: HTMLElement | null) => {
      setModelViewerElement(element);
    }, []);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      enterFullscreen: () => {
        containerRef.current?.requestFullscreen?.();
      },
      exitFullscreen: () => {
        document.exitFullscreen?.();
      },
      isFullscreen: () => {
        return document.fullscreenElement === containerRef.current;
      },
    }));

    if (error) {
      return (
        <div
          className={`flex items-center justify-center bg-surface/50 rounded-xl ${className}`}
          style={style}
        >
          <div className="text-center text-muted-foreground p-4">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      );
    }

    if (!isReady) {
      return (
        <div
          className={`flex items-center justify-center bg-surface/50 rounded-xl ${className}`}
          style={style}
        >
          <div className="text-center text-muted-foreground p-4 animate-pulse">
            <p>Initializing 3D viewer...</p>
          </div>
        </div>
      );
    }

    return (
      <div ref={containerRef} className={`relative ${className}`} style={style}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 rounded-xl">
            <div className="text-center text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm">Loading 3D model...</p>
            </div>
          </div>
        )}
        <model-viewer
          ref={handleModelViewerRef}
          src={src}
          alt={alt}
          poster={poster}
          camera-controls={cameraControls}
          auto-rotate={autoRotate}
          shadow-intensity={shadowIntensity}
          shadow-softness={shadowSoftness}
          exposure={exposure}
          environment-image={environmentImage}
          interaction-prompt="auto"
          loading="eager"
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "transparent",
            "--poster-color": "transparent",
          } as React.CSSProperties}
        />
      </div>
    );
  }
);

