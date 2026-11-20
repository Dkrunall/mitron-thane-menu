import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { RegisterServiceWorker } from "@/components/RegisterServiceWorker";
import "./globals.css";

// "Neon Rooftop" type system: Sora for body copy and UI chrome, Bebas Neue
// as the bold condensed display face used via the .display class for hero
// wordmarks and screen titles (--font-heading, also Sora, backs h1-h6).
//
// Self-hosted (latin subset, from Google Fonts) instead of next/font/google:
// that downloads the fonts during `next build`, which failed on the
// production host ("An error occurred in `next/font`"). Sora is a variable
// font, so one file covers weights 400-800.
const sora = localFont({
  src: "./fonts/sora-latin-variable.woff2",
  variable: "--font-sans",
  weight: "400 800",
  display: "swap",
});

const soraHeading = localFont({
  src: "./fonts/sora-latin-variable.woff2",
  variable: "--font-heading",
  weight: "400 800",
  display: "swap",
});

const bebasNeue = localFont({
  src: "./fonts/bebas-neue-latin-400.woff2",
  variable: "--font-display",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mitron Thane",
  description: "Scan, order, enjoy — table ordering for Mitron Thane.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mitron Thane",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0b09",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${soraHeading.variable} ${bebasNeue.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col font-sans selection:bg-amber-500 selection:text-black">
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
