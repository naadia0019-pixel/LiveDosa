import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["500", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "AirDosa | AI-Powered Instant Dosa Drone Delivery",
  description: "Get steaming hot, super crisp dosas delivered straight to your balcony at Mach 2 speeds by our autonomous AI drones. Experience the future of breakfast today.",
  keywords: ["AirDosa", "drone food delivery", "instant dosa delivery", "AI food service", "futuristic Indian food", "Indian startup"],
  authors: [{ name: "AirDosa Technologies" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
