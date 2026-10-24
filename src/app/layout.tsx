import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { League_Spartan, Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const leagueSpartan = League_Spartan({
  variable: "--font-league-spartan",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Rockhouse ATL",
  description: "Rockhouse Landscaping & Construction",
  icons: {
    icon: [
      {
        url: "https://yjhismyabucftxodwyxg.supabase.co/storage/v1/object/public/media/admin/2025-08-17/rockhouse-icon.png?v=5",
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: "https://yjhismyabucftxodwyxg.supabase.co/storage/v1/object/public/media/admin/2025-08-17/rockhouse-icon.png?v=5",
        type: "image/png",
        sizes: "16x16",
      },
    ],
    apple: [
      {
        url: "https://yjhismyabucftxodwyxg.supabase.co/storage/v1/object/public/media/admin/2025-08-17/rockhouse-icon.png?v=5",
        sizes: "180x180",
      },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "https://yjhismyabucftxodwyxg.supabase.co/storage/v1/object/public/media/admin/2025-08-17/safari-pinned-tab.svg?v=5",
        color: "#111827",
      },
    ],
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
        className={`${geistSans.variable} ${geistMono.variable} ${leagueSpartan.variable} ${montserrat.variable} ${openSans.variable} antialiased min-h-screen flex flex-col`}
      >
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
