import type { CoverTheme } from "./types";

type CoverPalette = {
  background: string;
  ink: string;
  accent: string;
  muted: string;
  pattern: "rings" | "grid" | "arcs" | "ticks";
};

export const COVER_PALETTES: Record<CoverTheme, CoverPalette> = {
  lime: {
    background: "#d9ff43",
    ink: "#161613",
    accent: "#161613",
    muted: "rgba(22,22,19,0.55)",
    pattern: "rings",
  },
  coral: {
    background: "#ff5c35",
    ink: "#1b0f0b",
    accent: "#ffe3d6",
    muted: "rgba(27,15,11,0.55)",
    pattern: "arcs",
  },
  ink: {
    background: "#161613",
    ink: "#f4f1e8",
    accent: "#d9ff43",
    muted: "rgba(244,241,232,0.55)",
    pattern: "grid",
  },
  sky: {
    background: "#a9c7ff",
    ink: "#101728",
    accent: "#101728",
    muted: "rgba(16,23,40,0.55)",
    pattern: "ticks",
  },
  sand: {
    background: "#e6d5b0",
    ink: "#2a2115",
    accent: "#2a2115",
    muted: "rgba(42,33,21,0.55)",
    pattern: "arcs",
  },
  lilac: {
    background: "#c9b8ff",
    ink: "#1a1229",
    accent: "#1a1229",
    muted: "rgba(26,18,41,0.55)",
    pattern: "rings",
  },
};

export function coverPalette(theme: string): CoverPalette {
  return COVER_PALETTES[(theme as CoverTheme) in COVER_PALETTES ? (theme as CoverTheme) : "lime"];
}
