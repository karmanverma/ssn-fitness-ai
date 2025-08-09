import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { EnhancedAIAssistantProvider } from "@/contexts/enhanced-ai-assistant-context";
import { AuthProvider } from "@/contexts/auth-context";
import { ProfileProvider } from "@/contexts/profile-context";
import { GlobalAIAssistant } from "@/components/global/ai-assistant";
import { AILayout } from "@/components/global/ai-layout";
import { ResponsiveHeader } from "@/components/global/responsive-header";
import { GeminiErrorBoundary } from "@/components/error-boundary";
import Footer from "@/components/global/footer";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SSN Fitness - Your Complete Fitness Companion",
  description: "Your complete fitness companion offering personalized consultations, custom workout plans, expert supplement guidance, and powerful health tracking tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
        style={{
          boxShadow: `
            inset 0 20px 30px -12px rgba(244, 63, 94, 0.2),
            inset 0 -20px 30px -12px rgba(244, 63, 94, 0.2)
          `,
        }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ProfileProvider>
              <GeminiErrorBoundary>
                <EnhancedAIAssistantProvider>
                  <AILayout>
                    <ResponsiveHeader />
                    <main className="min-h-screen relative z-10">
                      {children}
                    </main>
                    <Footer />
                  </AILayout>
                  <GlobalAIAssistant />
                </EnhancedAIAssistantProvider>
              </GeminiErrorBoundary>
            </ProfileProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
