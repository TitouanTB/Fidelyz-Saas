import type { Metadata } from "next";
import { Syne, Inter } from "next/font/google";
import { QueryProvider, ThemeProvider, AuthProvider } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const syne = Syne({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Fidelyz - Customer Loyalty Platform",
  description: "Build customer loyalty with powerful campaigns, rewards, and analytics.",
  keywords: ["loyalty", "customer retention", "rewards", "campaigns", "analytics"],
  authors: [{ name: "Fidelyz Team" }],
  openGraph: {
    title: "Fidelyz - Customer Loyalty Platform",
    description: "Build customer loyalty with powerful campaigns, rewards, and analytics.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${syne.variable} ${inter.variable} font-body antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <QueryProvider>
              {children}
              <Toaster richColors position="top-right" />
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}