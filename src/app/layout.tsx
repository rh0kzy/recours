import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
        className={`${montserrat.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
