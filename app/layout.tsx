import type { Metadata } from "next";
import "./globals.css";
import { AppToaster } from "@/components/Toaster";
import SetupBanner from "@/components/SetupBanner";
import { isDemoMode } from "@/lib/supabase/client";

export const metadata: Metadata = {
  title: "StyleMatch | Study Twitter voices. Generate in their style.",
  description: "Paste any creator's tweets. Generate 7 posts in their exact voice. Completely free for everyone.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#0a0a0a] text-white">
        <SetupBanner />
        {isDemoMode && (
          <div className="fixed bottom-4 right-4 z-50 text-[10px] bg-black/70 text-yellow-400 px-2 py-1 rounded border border-yellow-900">
            DEMO MODE
          </div>
        )}
        {children}
        <AppToaster />
      </body>
    </html>
  );
}