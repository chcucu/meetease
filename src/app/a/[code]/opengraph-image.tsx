import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getActivityDetail } from "@/lib/activities";

export const alt = "Quorum 决策页";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PAPER = "#f2efe6";
const INK = "#171714";
const MUTED = "#736f63";
const ACID = "#d9ff43";
const CORAL = "#ff5c35";
const SURFACE = "#fbfaf5";

type Props = { params: Promise<{ code: string }> };

function truncate(text: string, max: number) {
  const chars = Array.from(text.trim());
  if (chars.length <= max) return chars.join("");
  return `${chars.slice(0, max).join("")}…`;
}

let fontCache: Buffer | null | undefined;

async function loadFont() {
  if (fontCache !== undefined) return fontCache;
  try {
    fontCache = await readFile(join(process.cwd(), "src/app/a/[code]/og-font.otf"));
  } catch {
    fontCache = null;
  }
  return fontCache;
}

export default async function Image({ params }: Props) {
  const { code } = await params;

  let title = "群组决策，一处定音";
  let shareCode = code.toUpperCase();
  let participants: number | null = null;
  let consensus: number | null = null;

  try {
    const activity = await getActivityDetail(code.toUpperCase());
    if (activity) {
      title = truncate(activity.title || "未命名决策", 40);
      shareCode = activity.shareCode;
      participants = activity.counts.participants;
      const values = [activity.consensus?.time, activity.consensus?.place].filter(
        (value): value is number => typeof value === "number"
      );
      consensus = values.length > 0 ? Math.round(Math.max(...values)) : null;
    }
  } catch {
    // Fall through with the generic card.
  }

  const font = await loadFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: PAPER,
          padding: "56px 64px",
          fontFamily: "Noto Sans SC",
          color: INK,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 330,
            height: 330,
            display: "flex",
            background: ACID,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 282,
            right: 282,
            width: 126,
            height: 126,
            display: "flex",
            borderRadius: 999,
            background: CORAL,
            border: `3px solid ${INK}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: 220,
            height: 14,
            display: "flex",
            background: CORAL,
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 28, letterSpacing: "0.32em", color: INK }}>
              QUORUM
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 18,
                fontSize: 22,
                letterSpacing: "0.16em",
                color: MUTED,
              }}
            >
              GROUP DECISION
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", maxWidth: 940 }}>
            <div
              style={{
                display: "flex",
                fontSize: 76,
                lineHeight: 1.08,
                letterSpacing: "-0.02em",
                color: INK,
              }}
            >
              {title}
            </div>
            <div style={{ display: "flex", alignItems: "center", marginTop: 30 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: `2px solid ${INK}`,
                  background: SURFACE,
                  padding: "10px 20px",
                  fontSize: 26,
                  letterSpacing: "0.22em",
                }}
              >
                {shareCode}
              </div>
              {participants !== null && (
                <div style={{ display: "flex", marginLeft: 20, fontSize: 24, color: MUTED }}>
                  {`${participants} 人参与`}
                </div>
              )}
              {consensus !== null && (
                <div
                  style={{
                    display: "flex",
                    marginLeft: 20,
                    padding: "8px 16px",
                    background: CORAL,
                    border: `2px solid ${INK}`,
                    fontSize: 24,
                  }}
                >
                  {`共识 ${consensus}%`}
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", fontSize: 22, letterSpacing: "0.16em", color: MUTED }}>
              实时汇总 · 无需注册
            </div>
            <div style={{ display: "flex", fontSize: 44, color: INK }}>quorum</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font
        ? [{ name: "Noto Sans SC", data: font, style: "normal", weight: 400 }]
        : undefined,
    }
  );
}
