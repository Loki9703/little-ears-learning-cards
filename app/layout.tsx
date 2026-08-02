import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "小耳朵点点乐｜宝宝认知点读卡";
const description = "专为一岁半到两岁宝宝设计的认知点读卡，包含 12 种动物与 12 种交通工具。点图片听童趣称呼、真实声音和温柔小知识。";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: imageUrl, width: 1536, height: 941, alt: "小耳朵点点乐儿童认知点读卡" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

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
