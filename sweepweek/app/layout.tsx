import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BottomNav } from "@/components/nav/BottomNav";
import { PollRefresh } from "@/components/PollRefresh";
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
  title: "SweepWeek",
  description: "Putzplan für den Haushalt",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7f8" },
    { media: "(prefers-color-scheme: dark)", color: "#15171a" },
  ],
};

const themeInitScript = `
(function () {
  try {
    var stored = window.localStorage.getItem('sweepweek-theme');
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.setAttribute('data-theme', stored);
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex h-full min-h-full justify-center bg-bg font-sans text-text">
        <PollRefresh />
        <div className="flex w-full max-w-[480px] flex-1 flex-col">
          <div className="flex flex-1 flex-col overflow-y-auto">{children}</div>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
