import type { Metadata, Viewport } from "next";
import { Sora, Bebas_Neue } from "next/font/google";
import { RegisterServiceWorker } from "@/components/RegisterServiceWorker";
import "./globals.css";

// "Neon Rooftop" type system: Sora for body copy and UI chrome (replaces
// Plus Jakarta Sans), Bebas Neue as the bold condensed display face used
// via the .display class for hero wordmarks and screen titles (replaces
// Outfit as --font-heading, which still backs h1-h6 weight/leading).
const sora = Sora({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const soraHeading = Sora({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
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
