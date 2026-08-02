import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "小耳朵点点乐｜宝宝认知点读卡",
  description: "专为一岁半到两岁宝宝设计的动物与车辆认知点读卡。点图片听声音，左右滑动换一张。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
