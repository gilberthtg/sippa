import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from 'sonner';
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SiPPA - Sistem Informasi Permintaan Pengembangan Aplikasi",
  description: "Sistem untuk mengelola permintaan pengembangan aplikasi DevTI",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-gray-50" suppressHydrationWarning>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
