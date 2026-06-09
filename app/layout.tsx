import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Image Hub",
  description:
    "An experimental showcase of AI-generated imagery, demonstrating how different models turn prompts into visual results.",
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
