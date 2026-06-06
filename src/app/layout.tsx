import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/Providers";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "SosuGem Alpha | AI Crypto Research & Autonomous Trading Agent",
  description: "A premium, Apple-level AI-powered crypto hedge fund research and automated execution system for the SoSoValue Buildathon.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth dark">
      <body className="bg-background text-foreground min-h-full font-sans antialiased">
        <AppProviders>
          <div className="flex min-h-screen">
            {/* Sidebar drawer */}
            <Sidebar />

            {/* Main content wrapper */}
            <div className="flex-1 flex flex-col md:pl-64 min-w-0">
              <Navbar />
              
              {/* Dynamic page routes */}
              <main className="flex-grow p-6 pt-24 md:pt-6 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
