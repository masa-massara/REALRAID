import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import  AppProvider  from "./provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "文字もじ",
  description: "初めましてをプチゲームにするWEBアプリ！仲間と協力して、散らばった文字を集めて言葉を作ろう！",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </AppProvider>
    
  );
}
