import type { Metadata, Viewport } from "next";
import { Inter, Fragment_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/smooth-scroll";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fragmentMono = Fragment_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-fragment-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://coconutos.org"),
  title: "Coconut OS — agents as first-class kernel primitives",
  description:
    "A Linux distribution where every agent gets an AID, a capability bundle, an attestation chain, and a row in the audit log — the same way every process gets a PID today. From Coconut Labs.",
  applicationName: "Coconut OS",
  authors: [{ name: "Coconut Labs", url: "https://coconutlabs.org" }],
  creator: "Coconut Labs",
  keywords: [
    "Coconut OS",
    "Linux distribution",
    "agent operating system",
    "capability security",
    "kernel agents",
    "AI infrastructure",
    "Coconut Labs",
  ],
  openGraph: {
    title: "Coconut OS — agents as first-class kernel primitives",
    description:
      "A Linux distribution where every agent gets an AID, a capability bundle, an attestation chain, and a row in the audit log.",
    url: "https://coconutos.org",
    siteName: "Coconut OS",
    locale: "en_US",
    type: "website",
    images: [
      { url: "/og.svg", width: 1200, height: 630, alt: "Coconut OS — agents as first-class kernel primitives" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Coconut OS — agents as first-class kernel primitives",
    description:
      "Linux 6.12, hard-forked. Capability-mediated access. Tamper-evident audit chain. Fair-share inference. Ships 2027.",
    images: ["/og.svg"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBF6EE" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1410" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fragmentMono.variable}`}>
      <body className="antialiased">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
