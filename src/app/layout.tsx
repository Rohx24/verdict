import type { Metadata } from "next";
import { Space_Grotesk, Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const technoMono = Share_Tech_Mono({
  variable: "--font-techmono",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Editor's Verdict",
  description:
    "Cinematic, apocalyptic edits decided in seconds. Upload a clip, get a verdict.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#05070a]">
      <body
        className={`${display.variable} ${technoMono.variable} antialiased min-h-screen bg-transparent`}
      >
        {children}
      </body>
    </html>
  );
}
