import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NotificationProvider, ThemeProvider } from "@/contexts";
import { NotificationToast } from "@/components/ui/notification-toast";
import { AppSetup } from "@/components/layout/AppSetup";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Notas App - Editor de Notas Local",
  description: "Editor de notas em Markdown com armazenamento local",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          <NotificationProvider>
            <AppSetup>
              {children}
              <NotificationToast />
            </AppSetup>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
