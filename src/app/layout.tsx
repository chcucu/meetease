import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { ToastProvider } from "@/components/toast";
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
    default: "Quorum · Group decision page",
    template: "%s · Quorum",
  },
  description:
    "创建决策页，分享链接，收集时间、地点与意见。参与者无需注册，结果实时汇总。",
  keywords: ["活动策划", "投票", "群组决策", "聚会", "团建", "Quorum"],
  openGraph: {
    title: "Quorum · Group decision page",
    description:
      "创建决策页，分享链接，收集时间、地点与意见。参与者无需注册，结果实时汇总。",
    type: "website",
    locale: "zh_CN",
    siteName: "Quorum",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quorum · Group decision page",
    description:
      "创建决策页，分享链接，收集时间、地点与意见。参与者无需注册，结果实时汇总。",
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
          <ToastProvider>
            {children}
            <div className="grain-overlay" aria-hidden="true" />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
