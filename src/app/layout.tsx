import type { Metadata } from "next";
import { Sora, DM_Sans } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://backwardbuilder.com"),
  title: {
    default: "Backward Builder — AI Assessment Creator for Teachers",
    template: "%s | Backward Builder",
  },
  description:
    "Tell it what students need to understand. It builds the assessment they'll take. AI-powered assessment creation for middle school history teachers.",
  keywords: ["assessment", "education", "AI", "history", "middle school", "teacher tools", "backward design", "UbD"],
  openGraph: {
    title: "Backward Builder — AI Assessment Creator for Teachers",
    description:
      "Describe what you taught. Get a complete, shareable assessment with auto-grading in minutes.",
    url: "https://backwardbuilder.com",
    siteName: "Backward Builder",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Backward Builder",
    description:
      "Tell it what students need to understand. It builds the assessment they'll take.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-warmwhite text-text font-body">
        {children}
      </body>
    </html>
  );
}
