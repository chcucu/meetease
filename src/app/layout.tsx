import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Quorum · 群体决策平台",
    template: "%s · Quorum",
  },
  description:
    "创建决策页，分享一个链接，收集时间、地点与意见。参与者无需注册，结果实时汇总。DeepSeek 展示项目。",
  keywords: ["群体决策", "投票", "聚会", "团建", "活动策划", "Quorum", "DeepSeek"],
  openGraph: {
    title: "Quorum · 群体决策平台",
    description:
      "创建决策页，分享一个链接，收集时间、地点与意见。参与者无需注册，结果实时汇总。",
    type: "website",
    locale: "zh_CN",
    siteName: "Quorum",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quorum · 群体决策平台",
    description: "一个链接，完成时间、地点与意见的收集。结果实时汇总。",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f8fa",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={`${geist.variable} ${geistMono.variable}`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
