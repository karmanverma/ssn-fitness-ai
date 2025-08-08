import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { EnhancedAIAssistantProvider } from "@/contexts/enhanced-ai-assistant-context";
import { GlobalAIAssistant } from "@/components/global/ai-assistant";
import { AILayout } from "@/components/global/ai-layout";
import { ResponsiveHeader } from "@/components/global/responsive-header";
import { GeminiErrorBoundary } from "@/components/error-boundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MVP Blocks App",
  description: "A modern web application built with MVP Blocks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <GeminiErrorBoundary>
            <EnhancedAIAssistantProvider>
              <AILayout>
                <ResponsiveHeader />
                <main className="min-h-screen">
                  {children}
                </main>
              </AILayout>
              <GlobalAIAssistant />
            </EnhancedAIAssistantProvider>
          </GeminiErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
