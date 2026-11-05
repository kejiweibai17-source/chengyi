import type { Metadata } from "next";
import { Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import "./globals.css";

const sans = Noto_Sans_TC({
  variable: "--font-sans-tc",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const display = Noto_Serif_TC({
  variable: "--font-display-tc",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "橙益印刷｜印刷・包裝・設計",
  description:
    "橙益印刷事業——包裝盒、型錄與客製印刷。線上下單、人工檢稿、包裝盒 3D 詢價。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-Hant" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  );
}
