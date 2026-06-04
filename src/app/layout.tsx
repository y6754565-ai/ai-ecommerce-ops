import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#18181b",
};

export const metadata: Metadata = {
  title: "AI电商运营助手",
  description: "AI驱动的电商运营效率工具",
  appleWebApp: {
    capable: true,
    title: "电商运营助手",
    statusBarStyle: "black-translucent",
  },
  manifest: "/manifest.json",
  icons: {
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
