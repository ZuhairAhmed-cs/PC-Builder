"use client";

import { useRef, useState, useEffect } from "react";
import { useBuildStore } from "@/store/build-store";
import { ModelViewerWrapper, ModelViewerRef } from "./model-viewer-wrapper";
import { Maximize2, Minimize2, Monitor, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PCViewerProps {
  className?: string;
  theaterMode?: boolean;
  onTheaterModeChange?: (enabled: boolean) => void;
}

export function PCViewer({ 
  className = "", 
  theaterMode = false,
  onTheaterModeChange 
}: PCViewerProps) {
  const modelViewerRef = useRef<ModelViewerRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { selectedComponents } = useBuildStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const hasComponents = Object.values(selectedComponents).some(Boolean);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (isFullscreen) {
      await document.exitFullscreen();
    } else {
      await containerRef.current.requestFullscreen();
    }
  };

  const toggleTheaterMode = () => {
    onTheaterModeChange?.(!theaterMode);
  };

  if (!hasComponents) {
    return (
      <div 
        className={`w-full rounded-xl overflow-hidden bg-surface/30 border border-border/50 ${className}`}
        style={{ minHeight: theaterMode ? "70vh" : "400px" }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface/50 flex items-center justify-center">
              <Monitor className="w-8 h-8 opacity-50" />
            </div>
            <p className="text-lg font-medium mb-2">No Components Selected</p>
            <p className="text-sm opacity-70">Select components to see your build in 3D</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-xl overflow-hidden bg-[#0a0a0f] border border-border/50 ${className} ${
        isFullscreen ? "!fixed inset-0 !rounded-none z-50" : ""
      }`}
      style={{ 
        minHeight: isFullscreen ? "100vh" : theaterMode ? "70vh" : "400px",
        height: isFullscreen ? "100vh" : theaterMode ? "70vh" : "500px"
      }}
    >
      {/* Control Buttons */}
      <div className="absolute top-3 right-3 z-20 flex gap-2">
        {!isFullscreen && onTheaterModeChange && (
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheaterMode}
            className="bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background"
            title={theaterMode ? "Exit Theater Mode" : "Theater Mode"}
          >
            {theaterMode ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Monitor className="w-4 h-4" />
            )}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleFullscreen}
          className="bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? (
            <X className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Component Info Overlay */}
      <div className="absolute bottom-3 left-3 z-20">
        <div className="bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/50">
          <p className="text-xs text-muted-foreground">
            {Object.values(selectedComponents).filter(Boolean).length} components selected
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-3 right-3 z-20">
        <div className="bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/50">
          <p className="text-xs text-muted-foreground">
            Drag to rotate • Scroll to zoom
          </p>
        </div>
      </div>

      {/* 3D Model Viewer */}
      <ModelViewerWrapper
        ref={modelViewerRef}
        src="/models/custom_gaming_pc/scene.gltf"
        alt="Custom Gaming PC Build"
        autoRotate={true}
        cameraControls={true}
        shadowIntensity={1.2}
        shadowSoftness={1}
        exposure={1.1}
        environmentImage="neutral"
        className="w-full h-full"
        style={{ 
          width: "100%", 
          height: "100%",
          minHeight: "inherit"
        }}
      />
    </div>
  );
}
