import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CustodiaMed - Secure Medical Imaging Platform",
  description: "Share your medical imaging securely with healthcare providers. HIPAA-compliant, encrypted, and easy to use.",
  metadataBase: new URL("https://custodiamed.com"),
  openGraph: {
    title: "CustodiaMed - Secure Medical Imaging Platform",
    description: "Share your medical imaging securely with healthcare providers. HIPAA-compliant, encrypted, and easy to use.",
    url: "https://custodiamed.com",
    siteName: "CustodiaMed",
    type: "website",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
