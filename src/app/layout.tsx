import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Quorum — 一群人，一个答案",
    template: "%s · Quorum",
  },
  description:
    "Quorum 把时间、地点、预算和所有人的意见收进一张卡片。发一个链接，零注册投票，实时出结果。",
  keywords: ["活动策划", "投票", "群组决策", "聚会", "团建", "Quorum"],
  openGraph: {
    title: "Quorum — 一群人，一个答案",
    description: "发一个链接，把一群人的时间拧成一个答案。",
    type: "website",
    locale: "zh_CN",
    siteName: "Quorum",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quorum — 一群人，一个答案",
    description: "发一个链接，把一群人的时间拧成一个答案。",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f2efe6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={`${geist.variable} ${instrument.variable} ${jetbrains.variable}`}>
        <AuthProvider>
          {children}
          <div className="grain-overlay" aria-hidden="true" />
        </AuthProvider>
      </body>
    </html>
  );
}
