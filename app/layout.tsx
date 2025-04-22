import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeToggle } from "@/components/theme-toggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NextAuth Starter with Geolocation & Sign-In History",
  description: "Secure and customizable Next.js authentication starter using NextAuth, featuring user geolocation tracking and sign-in history logging.",
  keywords: [
    "NextAuth",
    "Next.js authentication",
    "NextAuth starter",
    "geolocation auth",
    "sign-in history",
    "login tracking",
    "nextjs auth template",
    "user auth logs",
    "nextjs secure login"
  ],
  metadataBase: new URL(`${process.env.DOMAIN_URL}`),
  openGraph: {
    title: "Nextjs Auth.js v5 Starter with Geolocation & Sign-In History",
    description: "Kickstart your Next.js project with built-in NextAuth, geolocation tracking, and secure login history.",
    url: process.env.DOMAIN_URL,
    siteName: "NextAuth Starter Kit",
    images: [
      {
        url: "/hero.avif",
        width: 1200,
        height: 630,
        alt: "NextAuth Starter Open Graph Image"
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NextAuth Starter with Geolocation & Sign-In History",
    description: "Next.js authentication boilerplate featuring secure sign-ins, geolocation tracking, and history logging.",
    images: [process.env.DOMAIN_URL+"/hero.avif"]
  },
  alternates: {
    canonical: process.env.DOMAIN_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-center"/>
        <ThemeToggle/>
      </body>
    </html>
  );
}
