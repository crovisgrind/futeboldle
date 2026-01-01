import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Craque do Dia - Desafio Diario de Futebol",
  description: "Voce conhece os idolos do futebol brasileiro? Acerte os 3 craques de hoje e mantenha sua sequencia no Craque do Dia.",
  keywords: ["futebol", "jogo", "wordle", "brasileirao", "craque do dia", "adivinhar jogador"],
  openGraph: {
    title: "Craque do Dia",
    description: "Tente adivinhar os 3 jogadores brasileiros de hoje.",
    url: "https://craquedodia.com.br",
    siteName: "Craque do Dia",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Craque do Dia - Jogo de adivinhar jogadores",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Craque do Dia",
    description: "Sera que voce consegue acertar os jogadores de hoje?",
    images: ["/og-image.png"],
  },
  // Correcao do erro de propriedade:
  icons: {
    icon: "/favicon.ico?v=1",
    apple: "/favicon.ico?v=1", // Agora o Next.js aceita 'apple' aqui dentro
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
    </html>
  );
}