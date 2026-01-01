import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// 1. Importe o GoogleAnalytics
import { GoogleAnalytics } from '@next/third-parties/google'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Craque do Dia - Desafio Diario de Futebol",
  description: "Voce conhece os idolos do futebol brasileiro? Acerte os 3 craques de hoje e mantenha sua sequencia no Craque do Dia.",
  // ... (mantenha o restante das metadados que já configuramos)
  icons: {
    icon: "/favicon.ico?v=1",
    apple: "/favicon.ico?v=1",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
      {/* 2. Adicione aqui logo após o body, substituindo pelo seu ID real */}
      <GoogleAnalytics gaId="G-JGWPL30VRR" />
    </html>
  );
}