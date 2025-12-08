import type { Metadata } from "next";
import { Inter, Orbitron, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ModelPreloader } from "@/components/3d/model-preloader";
import { ContentstackLivePreview } from "@/components/contentstack-live-preview";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PC Builder | Build Your Dream Machine",
  description:
    "Interactive PC Builder with personalized experience levels. Choose components, check compatibility, and visualize your build in 3D.",
  keywords: [
    "PC Builder",
    "Gaming PC",
    "Custom PC",
    "Computer Parts",
    "Build PC",
  ],
  icons: {
    icon: "https://eu-images.contentstack.com/v3/assets/blt46050ed83963b80a/blt4fb8b2731a38bf13/694d2428ef8f4a266e5bc461/logo-icon.svg",
    apple:
      "https://eu-images.contentstack.com/v3/assets/blt46050ed83963b80a/blt4fb8b2731a38bf13/694d2428ef8f4a266e5bc461/logo-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${orbitron.variable} ${geistMono.variable} antialiased min-h-screen circuit-bg`}
        suppressHydrationWarning
      >
        <ModelPreloader>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ModelPreloader>
        <ContentstackLivePreview />
      </body>
    </html>
  );
}
