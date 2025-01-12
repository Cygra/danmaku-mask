import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Danmaku Mask",
  description:
    "基于 Next.js 和 Mediapipe tasks-vision Image Segmenter 实现的模拟 Bilibili 实时防挡脸弹幕效果。" +
    "使用机器学习在人脸上渲染一个实时的 mask。" +
    "This site is developed with Next.js and Mediapipe tasks-vision Image Segmenter." +
    " Implementing machine learning to detect human face and render a real-time mask.",
  openGraph: {
    type: "website",
    url: "https://cygra.github.io/danmaku-mask/",
    title: "Danmaku Mask",
    description:
      "基于 Next.js 和 Mediapipe tasks-vision Image Segmenter 实现的模拟 Bilibili 实时防挡脸弹幕效果。" +
      "使用机器学习在人脸上渲染一个实时的 mask。" +
      "This site is developed with Next.js and Mediapipe tasks-vision Image Segmenter." +
      " Implementing machine learning to detect human face and render a real-time mask.",
    siteName: "Danmaku Mask",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <GoogleAnalytics gaId="G-2ZP5YG0JDG" />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
