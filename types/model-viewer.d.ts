import * as React from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          poster?: string;
          loading?: "auto" | "lazy" | "eager";
          reveal?: "auto" | "interaction" | "manual";
          "with-credentials"?: boolean;
          "camera-controls"?: boolean;
          "disable-tap"?: boolean;
          "disable-zoom"?: boolean;
          "touch-action"?: string;
          "disable-pan"?: boolean;
          "interpolation-decay"?: number;
          "orbit-sensitivity"?: number;
          "auto-rotate"?: boolean;
          "auto-rotate-delay"?: number;
          "rotation-per-second"?: string;
          "interaction-prompt"?: "auto" | "none" | "when-focused";
          "interaction-prompt-style"?: "wiggle" | "basic";
          "interaction-prompt-threshold"?: number;
          ar?: boolean;
          "ar-modes"?: string;
          "ar-scale"?: "auto" | "fixed";
          "ar-placement"?: "floor" | "wall";
          "ios-src"?: string;
          "xr-environment"?: boolean;
          "skybox-image"?: string;
          "skybox-height"?: string;
          "environment-image"?: string;
          exposure?: number;
          "shadow-intensity"?: number;
          "shadow-softness"?: number;
          "animation-name"?: string;
          "animation-crossfade-duration"?: number;
          autoplay?: boolean;
          "variant-name"?: string;
          orientation?: string;
          scale?: string;
          "min-camera-orbit"?: string;
          "max-camera-orbit"?: string;
          "min-field-of-view"?: string;
          "max-field-of-view"?: string;
          "camera-orbit"?: string;
          "camera-target"?: string;
          "field-of-view"?: string;
          style?: React.CSSProperties;
          class?: string;
          className?: string;
          id?: string;
          slot?: string;
          ref?: React.Ref<any>;
        },
        HTMLElement
      >;
    }
  }
}
