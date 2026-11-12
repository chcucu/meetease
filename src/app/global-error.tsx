"use client";

import Link from "next/link";
import { useEffect } from "react";

const SERIF = '"Noto Serif CJK SC", "Noto Serif SC", "Songti SC", Georgia, serif';
const SANS = '"Noto Sans CJK SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';
const MONO = '"JetBrains Mono", "SFMono-Regular", "Cascadia Code", Consolas, monospace';

const buttonBase = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.55rem",
  padding: "0.78rem 1.15rem",
  border: "1px solid #171714",
  borderRadius: 2,
  fontFamily: SANS,
  fontSize: 14,
  fontWeight: 500,
  lineHeight: 1.2,
  textDecoration: "none",
  cursor: "pointer",
} as const;

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="zh-CN">
      <body
        style={{
          margin: 0,
          backgroundColor: "#f2efe6",
          color: "#171714",
          fontFamily: SANS,
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <main
          style={{
            position: "relative",
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.6,
              backgroundImage:
                "linear-gradient(to right, rgba(23,23,20,0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(23,23,20,0.055) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 928,
              margin: "0 auto",
              padding: "64px 24px",
            }}
          >
            <div
              style={{
                maxWidth: 560,
                border: "1px solid #171714",
                background: "#fbfaf5",
                padding: 32,
                boxShadow: "6px 6px 0 #171714",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: MONO,
                  fontSize: 10.5,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#736f63",
                }}
              >
                Quorum · System
              </p>
              <h1
                style={{
                  margin: "16px 0 0",
                  fontFamily: SERIF,
                  fontWeight: 400,
                  fontSize: "clamp(2rem, 4.4vw, 3.4rem)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.03em",
                }}
              >
                这一页出了点<span style={{ color: "#ff5c35", fontStyle: "italic" }}>问题</span>
              </h1>
              <p
                style={{
                  margin: "14px 0 0",
                  fontSize: 13,
                  lineHeight: 1.75,
                  color: "#736f63",
                }}
              >
                页面在加载时遇到了意外错误。可以重试一次，或回到首页重新开始。
              </p>

              {error.digest ? (
                <p
                  style={{
                    margin: "12px 0 0",
                    fontFamily: MONO,
                    fontSize: 10,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#736f63",
                  }}
                >
                  Digest · {error.digest}
                </p>
              ) : null}

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 26 }}>
                <button
                  type="button"
                  onClick={() => retry()}
                  style={{
                    ...buttonBase,
                    background: "#d9ff43",
                    color: "#171714",
                    boxShadow: "3px 3px 0 #171714",
                  }}
                >
                  重试
                </button>
                <Link
                  href="/"
                  style={{
                    ...buttonBase,
                    background: "transparent",
                    borderColor: "#b5af9e",
                    color: "#171714",
                  }}
                >
                  回到首页
                </Link>
              </div>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
