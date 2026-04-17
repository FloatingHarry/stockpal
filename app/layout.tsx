import type { Metadata } from "next";
import "@fontsource/fusion-pixel-12px-monospaced-sc";
import { fontBody, fontHud } from "@/app/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "StockPal | 像素情报台",
  description:
    "StockPal MVP 首页，使用本地场景库展示市场快讯、图表窗口和 AI companion 陪看界面。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${fontHud.variable} ${fontBody.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
