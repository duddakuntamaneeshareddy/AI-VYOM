import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

import { getCurrentUser } from "@/lib/auth/supabase-auth";
import { Providers } from "@/components/providers";
import { RouteShell } from "@/components/layout/route-shell";
import { Toaster } from "@/components/ui/sonner";
import { FloatingBot } from "@/components/bot/floating-bot";
import { NotificationToast } from "@/components/notifications/notification-toast";
import { EngagementPrompts } from "@/components/notifications/engagement-prompts";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AI VYOM",
  description: "AI-powered e-commerce experience.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <Providers>
          <RouteShell user={user}>{children}</RouteShell>
          <FloatingBot />
        </Providers>
        <NotificationToast />
        <EngagementPrompts />
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
