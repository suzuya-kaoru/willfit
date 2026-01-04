import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type React from "react";
import "./globals.css";
import { ModeToggle } from "@/components/mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

// <CHANGE> Updated metadata for workout tracker app
export const metadata: Metadata = {
  title: "WillFit - Workout Tracker",
  description:
    "Track your workouts, monitor progress, and achieve your fitness goals",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/logo-light.svg",
        media: "(prefers-color-scheme: light)",
        type: "image/svg+xml",
      },
      {
        url: "/logo.svg",
        media: "(prefers-color-scheme: dark)",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

// <CHANGE> Added viewport configuration for mobile optimization
export const viewport: Viewport = {
  themeColor: "#1a1a2e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="fixed top-4 right-4 z-50">
            <ModeToggle />
          </div>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
