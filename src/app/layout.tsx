import type { Metadata } from "next";
import { ZCOOL_KuaiLe, Fredoka } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import MacMenuBar from "@/components/MacMenuBar";
import MacDock from "@/components/MacDock";
import { AuthProvider } from "@/context/AuthContext";

const zcool = ZCOOL_KuaiLe({
  variable: "--font-zcool",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MeetEase 聚会 · 让聚会更简单",
  description: "蓝白黄夏日主题的专业活动组织平台 — 动态表单、智能投票、实时协作",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${zcool.variable} ${fredoka.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <MacMenuBar />
          <main className="flex-1 pb-20">{children}</main>
          <MacDock />
        </AuthProvider>
      </body>
    </html>
  );
}