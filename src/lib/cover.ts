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
    background: "linear-gradient(135deg, #f0f4ff 0%, #dbe3ff 100%)",
    ink: "#17204a",
    accent: "#4d6bfe",
    muted: "rgba(23,32,74,0.58)",
    pattern: "rings",
  },
  coral: {
    background: "linear-gradient(135deg, #fff5f1 0%, #ffe3da 100%)",
    ink: "#3b1b12",
    accent: "#d94a3d",
    muted: "rgba(59,27,18,0.58)",
    pattern: "arcs",
  },
  ink: {
    background: "linear-gradient(135deg, #141a2a 0%, #0b0f1a 100%)",
    ink: "#f7f8fa",
    accent: "#a9bcff",
    muted: "rgba(247,248,250,0.58)",
    pattern: "grid",
  },
  sky: {
    background: "linear-gradient(135deg, #f0f7ff 0%, #d9e8ff 100%)",
    ink: "#102038",
    accent: "#2f6bd8",
    muted: "rgba(16,32,56,0.58)",
    pattern: "ticks",
  },
  sand: {
    background: "linear-gradient(135deg, #faf6ee 0%, #efe4d0 100%)",
    ink: "#322818",
    accent: "#9a6b24",
    muted: "rgba(50,40,24,0.58)",
    pattern: "arcs",
  },
  lilac: {
    background: "linear-gradient(135deg, #f6f3ff 0%, #e7dfff 100%)",
    ink: "#221a3a",
    accent: "#6b4ee6",
    muted: "rgba(34,26,58,0.58)",
    pattern: "rings",
  },
};

export function coverPalette(theme: string): CoverPalette {
  return COVER_PALETTES[(theme as CoverTheme) in COVER_PALETTES ? (theme as CoverTheme) : "lime"];
}
