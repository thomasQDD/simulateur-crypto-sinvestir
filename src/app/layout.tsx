import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Lexend } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Simulateur Plus-Value Crypto | S'investir",
  description:
    "Calculez vos gains crypto en DCA ou en une seule fois à partir de données de marché historiques. Bitcoin, Ethereum et des milliers de cryptos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${jakarta.variable} ${lexend.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="app-bg min-h-screen">{children}</div>
      </body>
    </html>
  );
}
