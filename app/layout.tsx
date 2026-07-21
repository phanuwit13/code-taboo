import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_Thai } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "./components/header";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai", "latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Code Taboo",
  description: "เกมใบ้คำศัพท์สาย dev สำหรับทีม Frontend — ห้ามพูดคำต้องห้าม!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="th"
        className={`${notoSansThai.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-screen flex flex-col bg-white">
          <Header />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
