import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Art Hub",
  description: "A private-owner gallery for sharing AI-generated images and prompts.",
  icons: {
    icon: "/brand/ai-art-hub-logo.png",
    apple: "/brand/ai-art-hub-logo.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-scroll-behavior="smooth" lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
