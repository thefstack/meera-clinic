import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meera Clinic | Appointment Booking",
  description:
    "AI-powered appointment booking system for Meera Clinic. Patients can book, reschedule, and check doctor availability with ease.",
  keywords: [
    "Meera Clinic",
    "Appointment Booking",
    "Doctor Availability",
    "Healthcare",
    "Medical Scheduling",
    "AI Receptionist",
    "thefstack",
  ],
  authors: [{ name: "RAJ (thefstack)", url: "https://thefstack.com" }],
  creator: "RAJ (thefstack)",
  publisher: "RAJ (thefstack)",

  openGraph: {
    title: "Meera Clinic | Appointment Booking",
    description:
      "Book doctor appointments online at Meera Clinic. AI-powered assistant helps you schedule and manage appointments easily.",
    url: "https://meeraclinic.vercel.app",
    siteName: "Meera Clinic",
    images: [
      {
        url: "/clinic-banner.png", // place this in /public
        width: 1200,
        height: 630,
        alt: "Meera Clinic Appointment Booking",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Meera Clinic | Appointment Booking",
    description:
      "Book doctor appointments online at Meera Clinic. AI-powered assistant helps you schedule and manage appointments easily.",
    images: ["/clinic-banner.png"],
    creator: "@thefstack", // your Instagram/Twitter handle
  },

  metadataBase: new URL("https://meeraclinic.vercel.app"),

  // JSON-LD like profiles linking (good for SEO)
  alternates: {
    canonical: "https://meeraclinic.vercel.app",
  },
  other: {
    "profile:username": "thefstack",
    "profile:website": "https://thefstack.com",
    "profile:github": "https://github.com/thefstack",
    "profile:linkedin": "https://linkedin.com/in/thefstack",
    "profile:instagram": "https://instagram.com/thefstack",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
