import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finfo - Recours",
  description: "Système de gestion des demandes de changement de spécialité - Université des Sciences et de Technologie Houari Boumediene",
  keywords: ["USTHB", "Université", "Recours", "Changement de spécialité", "Algeria"],
  authors: [{ name: "USTHB Administration" }],
  creator: "USTHB",
  publisher: "Université des Sciences et de Technologie Houari Boumediene",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo-usthb.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
