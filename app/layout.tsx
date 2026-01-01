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
  title: "Craque do Dia ⚽ - Desafio Diário de Futebol",
  description: "Você conhece os ídolos do futebol brasileiro? Acerte os 3 craques de hoje e mantenha seu streak no Craque do Dia!",
  keywords: ["futebol", "jogo", "wordle", "brasileirão", "craque do dia", "adivinhar jogador"],
  authors: [{ name: "Craque do Dia" }],
  openGraph: {
    title: "Craque do Dia ⚽",
    description: "Tente adivinhar os 3 jogadores brasileiros de hoje!",
    url: "https://craquedodia.com.br",
    siteName: "Craque do Dia",
    images: [
      {
        url: "/og-image.png", // Certifique-se de salvar a imagem na pasta /public com este nome
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
    title: "Craque do Dia ⚽",
    description: "Será que você consegue acertar os jogadores de hoje?",
    images: ["/og-image.png"],
  },
  icons:[
      { url: '/favicon.ico?v=1' }, // O ?v=1 força o navegador a limpar o cache
    ],
    apple: [
      { url: '/favicon.ico?v=1' },
    ],
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